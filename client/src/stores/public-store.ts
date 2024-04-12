import { makeAutoObservable } from "mobx";

// import { makePersistable } from "mobx-persist-store";
// import DBController from "mobx-persist-store-idb-adapter";
import { v4 } from "uuid";
import type {
	State,
	Transaction,
	TransactionKey,
	TransactionPayload,
} from "../../../shared/types";
import type { RootStore } from "./root-store";
import { mutators } from "../../../shared/mutators";
import { WriteTransaction } from "../../../shared/write-transaction";
import { MobxStorage } from "@/lib/write-transaction";

export class PublicStore {
	rootStore: RootStore;
	clientState: State = {
		counter: 0,
		todos: [],
	};
	serverState: State = {
		counter: 0,
		todos: [],
	};
	webSocket: WebSocket | null = null;
	clientId = v4();
	mutationId = 0;
	clientTransactions: Transaction[] = [];
	unsentClientTransactions: Transaction[] = [];

	constructor(rootStore: RootStore) {
		// const indexedDBStore = new DBController("realtimeSyncEngine", "public", 1);

		makeAutoObservable(this, undefined, { autoBind: true });
		// makePersistable(this, {
		// 	name: "RealtimeSyncEnginePublicStorage",
		// 	properties: ["clientState"],
		// 	storage: indexedDBStore,
		// 	stringify: false,
		// });
		this.rootStore = rootStore;
	}

	setWebSocket(webSocket: WebSocket | null) {
		this.webSocket = webSocket;
	}

	async processTransactions(transactions: Transaction[]) {
		const serverTx = new WriteTransaction(new MobxStorage(this.serverState));

		for (const serverTransaction of transactions) {
			const conflictingTransaction = this.clientTransactions.find(
				(clientTransaction) =>
					clientTransaction.key === serverTransaction.key &&
					clientTransaction.clientId === serverTransaction.clientId &&
					clientTransaction.mutationId === serverTransaction.mutationId,
			);

			if (conflictingTransaction) {
				// If there is a conflicting client transaction, skip the server transaction
				console.warn(
					`Conflict detected for transaction ${serverTransaction.mutationId}. Skipping server transaction.`,
				);
			} else {
				await this.applyTransaction({
					tx: serverTx,
					key: serverTransaction.key,
					payload: serverTransaction.payload,
				});
			}
		}

		this.clientState = this.serverState;

		const clientTx = new WriteTransaction(new MobxStorage(this.clientState));

		for (const transaction of this.unsentClientTransactions) {
			await this.applyTransaction({
				tx: clientTx,
				key: transaction.key,
				payload: transaction.payload,
			});
		}
	}

	async mutate(key: TransactionKey, payload: TransactionPayload) {
		if (!this.webSocket) {
			return;
		}

		const timestamp = Date.now();
		const tx = new WriteTransaction(new MobxStorage(this.clientState));

		await this.applyTransaction({
			tx,
			key,
			payload,
		});

		const mutationId = this.incrementMutationId();

		const transaction: Transaction = {
			payload,
			timestamp,
			location: "client",
			reason: "initial",
			clientId: this.clientId,
			mutationId,
			key,
		};

		this.unsentClientTransactions.push(transaction);
	}

	async applyTransaction({
		tx,
		key,
		payload,
	}: {
		tx: WriteTransaction;
		key: TransactionKey;
		payload: TransactionPayload;
	}) {
		if (key === "counter") {
			switch (payload.type) {
				case "GET_COUNTER":
					await mutators.setCounter(tx, key, payload.value);
					break;

				case "SET_COUNTER":
					await mutators.setCounter(tx, key, payload.value);
					break;

				case "INCREMENT_COUNTER":
					await mutators.incrementCounter(tx, key, payload.delta);
					break;

				case "DECREMENT_COUNTER":
					await mutators.decrementCounter(tx, key, payload.delta);
					break;
			}
		} else if (key === "todos") {
			switch (payload.type) {
				case "LIST_TODOS":
					await mutators.setTodos(tx, key, payload.value);
					break;

				case "SET_TODOS":
					await mutators.setTodos(tx, key, payload.value);
					break;

				case "UPDATE_TODO":
					await mutators.updateTodo(tx, key, payload.value);
					break;

				case "SET_TODO":
					await mutators.setTodo(tx, key, payload.value);
					break;

				case "DELETE_TODO":
					await mutators.deleteTodo(tx, key, payload.id);
					break;
			}
		}
	}

	clearClientTransactions() {
		this.clientTransactions = [];
	}

	clearUnsentClientTransactions() {
		this.unsentClientTransactions = [];
	}

	appendClientTransactions(transactions: Transaction[]) {
		this.clientTransactions = [...this.clientTransactions, ...transactions];
	}

	incrementMutationId() {
		const prev: number = this.mutationId || 0;
		const next = prev + 1;
		this.mutationId = next;
		return next;
	}
}
