import { DurableObject } from 'cloudflare:workers';
import { Todo, Transaction } from '../../shared/types';
import { v4 } from 'uuid';
import { debounce } from 'lodash';
import { BUFFER_TIME_IN_MS } from './constants';

export interface Env {
	REALTIME_SYNC_ENGINE: DurableObjectNamespace<RealtimeSyncEngine>;
}

// Worker
export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);

		const path = url.pathname.split('/');

		if (path.length !== 3 || path[2] !== 'websocket') {
			return new Response('URL format is incorrect.', { status: 400 });
		}

		const roomSlug = path[1];

		let id = env.REALTIME_SYNC_ENGINE.idFromName(roomSlug);
		let stub = env.REALTIME_SYNC_ENGINE.get(id);

		return await stub.fetch(request);
	},
};

// Durable Object
export class RealtimeSyncEngine extends DurableObject {
	private conns = new Set<WebSocket>();
	private transactionQueue: Transaction[] = [];
	private clientId = v4();
	private mutationId = 0;
	private debouncedProcessTransactionQueue = debounce(this.processTransactionQueue.bind(this), BUFFER_TIME_IN_MS);

	async broadcast(message: string) {
		for (const conn of this.conns) {
			try {
				conn.send(message);
			} catch {
				// If the connection is closed, remove it from the Set
				this.conns.delete(conn);
			}
		}
	}

	async getCounter(key: string): Promise<number> {
		let value: number = (await this.ctx.storage.get(key)) || 0;
		return value;
	}

	async setCounter(key: string, amount?: number): Promise<number> {
		const prev: number = (await this.ctx.storage.get(key)) || 0;
		const next = prev || 0;
		await this.ctx.storage.put(key, next);
		return next;
	}

	async incrementCounter(key: string, amount = 1): Promise<number> {
		const prev: number = (await this.ctx.storage.get(key)) || 0;
		const next = prev + amount;
		await this.ctx.storage.put(key, next);
		return next;
	}

	async decrementCounter(key: string, amount = 1): Promise<number> {
		const prev: number = (await this.ctx.storage.get(key)) || 0;
		const next = prev - amount;
		await this.ctx.storage.put(key, next);
		return next;
	}

	async getTodos(key: string) {
		let value: Todo[] = (await this.ctx.storage.get(key)) || [];
		return value;
	}

	async setTodo(key: string, newTodo: Todo) {
		const prev: Todo[] = (await this.ctx.storage.get(key)) || [];
		const next = [...prev, newTodo];
		await this.ctx.storage.put(key, next);
		return next;
	}

	async updateTodo(key: string, value: Partial<Todo> & Required<Pick<Todo, 'id'>>) {
		const prev: Todo[] = (await this.ctx.storage.get(key)) || [];
		const next = prev.map((todo) => (todo.id === value.id ? { ...todo, ...value } : todo));
		await this.ctx.storage.put(key, next);
		return next;
	}

	async deleteTodo(key: string, { id }: Pick<Todo, 'id'>) {
		const prev: Todo[] = (await this.ctx.storage.get(key)) || [];
		const next = prev.filter((todo) => todo.id !== id);
		await this.ctx.storage.put(key, next);
		return next;
	}

	async fetch(request: Request): Promise<Response> {
		if (request.url.endsWith('/websocket')) {
			// Expect to receive a WebSocket Upgrade request.
			// If there is one, accept the request and return a WebSocket Response.
			const upgradeHeader = request.headers.get('Upgrade');
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
			}

			const webSocketPair = new WebSocketPair();
			const [client, server] = Object.values(webSocketPair);

			server.accept();
			this.conns.add(server);
			this.onOpen(server);

			server.addEventListener('message', async (event: MessageEvent) => {
				const transactions: Transaction[] = JSON.parse(event.data as string);

				console.log({ transactions });

				for (const transaction of transactions) {
					this.transactionQueue.push(transaction);
				}

				// Debounced processing of the queue
				this.debouncedProcessTransactionQueue();
			});

			// If the client closes the connection, the runtime will close the connection too.
			server.addEventListener('close', async (cls: CloseEvent) => {
				this.conns.delete(server);
				server.close(cls.code, 'Durable Object is closing WebSocket');
			});

			return new Response(null, {
				status: 101,
				webSocket: client,
			});
		}

		return new Response(`
		This Durable Object supports the following endpoints:
			/websocket
				- Creates a WebSocket connection. Any messages sent to it are echoed with a prefix.
		`);
	}

	private async processTransactionQueue() {
		const messages: Transaction[] = [];
		this.transactionQueue.sort((a, b) => a.timestamp - b.timestamp);

		console.log(this.transactionQueue);

		while (this.transactionQueue.length > 0) {
			const transaction = this.transactionQueue.shift();
			if (!transaction) continue;

			switch (transaction.payload.type) {
				case 'INCREMENT_COUNTER':
					await this.incrementCounter(transaction.key, transaction.payload.delta);
					break;

				case 'DECREMENT_COUNTER':
					await this.decrementCounter(transaction.key, transaction.payload.delta);
					break;

				case 'SET_COUNTER':
					await this.setCounter(transaction.key, transaction.payload.value);
					break;

				case 'UPDATE_TODO':
					await this.updateTodo(transaction.key, transaction.payload.value);
					break;

				case 'SET_TODO':
					await this.setTodo(transaction.key, transaction.payload.value);
					break;

				case 'DELETE_TODO':
					await this.deleteTodo(transaction.key, transaction.payload.id);
					break;
			}

			let mutationId = this.mutationId;
			mutationId += 1;
			this.mutationId = mutationId;

			let message: Transaction = {
				roomId: this.ctx.id.toString(),
				timestamp: Date.now(),
				location: 'server',
				reason: 'authoritative',
				clientId: transaction.clientId,
				mutationId: transaction.mutationId,
				payload: transaction.payload,
				key: transaction.key,
			};

			messages.push(message);
		}

		console.log({ messages });
		this.broadcast(JSON.stringify(messages));
	}

	private async onOpen(server: WebSocket) {
		const counter = await this.getCounter('counter');
		let mutationId = this.mutationId;
		mutationId += 1;
		this.mutationId = mutationId;

		let counterMessage: Transaction = {
			roomId: this.ctx.id.toString(),
			timestamp: Date.now(),
			clientId: this.clientId,
			mutationId: mutationId,
			location: 'server',
			reason: 'authoritative',
			payload: {
				type: 'GET_COUNTER',
				value: counter,
			},
			key: 'counter',
		};

		const todos = await this.getTodos('todos');
		mutationId += 1;
		this.mutationId = mutationId;

		let todosMessage: Transaction = {
			roomId: this.ctx.id.toString(),
			timestamp: Date.now(),
			clientId: this.clientId,
			mutationId: mutationId,
			location: 'server',
			reason: 'authoritative',
			payload: {
				type: 'LIST_TODOS',
				value: todos,
			},
			key: 'todos',
		};

		server.send(JSON.stringify([counterMessage, todosMessage]));
	}
}
