import { DurableObject } from 'cloudflare:workers'
import { debounce } from 'lodash'
import { v4 } from 'uuid'

import { mutators } from '../../shared/mutators'
import type { Transaction } from '../../shared/types'
import { WriteTransaction } from '../../shared/write-transaction'
import { BUFFER_TIME_IN_MS } from './constants'
import { CloudflareStorage } from './write-transaction'

export interface Env {
	REALTIME_SYNC_ENGINE: DurableObjectNamespace<RealtimeSyncEngine>
}

// Worker
export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url)

		const path = url.pathname.split('/')

		if (path.length !== 3 || path[2] !== 'websocket') {
			return new Response('URL format is incorrect.', { status: 400 })
		}

		const roomSlug = path[1]

		const id = env.REALTIME_SYNC_ENGINE.idFromName(roomSlug)
		const stub = env.REALTIME_SYNC_ENGINE.get(id)

		return await stub.fetch(request)
	},
}

// Durable Object
export class RealtimeSyncEngine extends DurableObject {
	private conns = new Set<WebSocket>()
	private transactionQueue: Transaction[] = []
	private clientId = v4()
	private mutationId = 0
	private debouncedProcessTransactionQueue = debounce(
		this.processTransactionQueue.bind(this),
		BUFFER_TIME_IN_MS,
	)
	private tx = new WriteTransaction(new CloudflareStorage(this.ctx))

	async broadcast(message: string) {
		for (const conn of this.conns) {
			try {
				conn.send(message)
			} catch {
				// If the connection is closed, remove it from the Set
				this.conns.delete(conn)
			}
		}
	}

	async fetch(request: Request): Promise<Response> {
		if (request.url.endsWith('/websocket')) {
			// Expect to receive a WebSocket Upgrade request.
			// If there is one, accept the request and return a WebSocket Response.
			const upgradeHeader = request.headers.get('Upgrade')
			if (!upgradeHeader || upgradeHeader !== 'websocket') {
				return new Response('Durable Object expected Upgrade: websocket', {
					status: 426,
				})
			}

			const webSocketPair = new WebSocketPair()
			const [client, server] = Object.values(webSocketPair)

			server.accept()
			this.conns.add(server)
			this.onOpen(server)

			server.addEventListener('message', async (event: MessageEvent) => {
				const transactions: Transaction[] = JSON.parse(event.data as string)

				for (const transaction of transactions) {
					this.transactionQueue.push(transaction)
				}

				// Debounced processing of the queue
				this.debouncedProcessTransactionQueue()
			})

			// If the client closes the connection, the runtime will close the connection too.
			server.addEventListener('close', async (cls: CloseEvent) => {
				this.conns.delete(server)
				server.close(cls.code, 'Durable Object is closing WebSocket')
			})

			return new Response(null, {
				status: 101,
				webSocket: client,
			})
		}

		return new Response(`
		This Durable Object supports the following endpoints:
			/websocket
				- Creates a WebSocket connection. Any messages sent to it are echoed with a prefix.
		`)
	}

	private async processTransactionQueue() {
		const messages: Transaction[] = []
		this.transactionQueue.sort((a, b) => a.timestamp - b.timestamp)

		while (this.transactionQueue.length > 0) {
			const transaction = this.transactionQueue.shift()
			if (!transaction) continue

			switch (transaction.payload.type) {
				case 'INCREMENT_COUNTER':
					await mutators.incrementCounter(
						this.tx,
						transaction.key,
						transaction.payload.delta,
					)
					break

				case 'DECREMENT_COUNTER':
					await mutators.decrementCounter(
						this.tx,
						transaction.key,
						transaction.payload.delta,
					)
					break

				case 'SET_COUNTER':
					await mutators.setCounter(
						this.tx,
						transaction.key,
						transaction.payload.value,
					)
					break

				case 'UPDATE_TODO':
					await mutators.updateTodo(
						this.tx,
						transaction.key,
						transaction.payload.value,
					)
					break

				case 'SET_TODO':
					await mutators.setTodo(
						this.tx,
						transaction.key,
						transaction.payload.value,
					)
					break

				case 'DELETE_TODO':
					await mutators.deleteTodo(
						this.tx,
						transaction.key,
						transaction.payload.id,
					)
					break
			}

			let mutationId = this.mutationId
			mutationId += 1
			this.mutationId = mutationId

			const message: Transaction = {
				roomId: this.ctx.id.toString(),
				timestamp: Date.now(),
				location: 'server',
				reason: 'authoritative',
				clientId: transaction.clientId,
				mutationId: transaction.mutationId,
				payload: transaction.payload,
				key: transaction.key,
			}

			messages.push(message)
		}

		this.broadcast(JSON.stringify(messages))
	}

	private async onOpen(server: WebSocket) {
		const counter = await mutators.getCounter(this.tx, 'counter')
		let mutationId = this.mutationId
		mutationId += 1
		this.mutationId = mutationId

		const counterMessage: Transaction = {
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
		}

		const todos = await mutators.listTodos(this.tx, 'todos')
		mutationId += 1
		this.mutationId = mutationId

		const todosMessage: Transaction = {
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
		}

		server.send(JSON.stringify([counterMessage, todosMessage]))
	}
}
