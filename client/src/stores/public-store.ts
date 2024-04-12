import { makeAutoObservable } from "mobx";

import { RootStore } from "./root-store";
import {
  Transaction,
  Todo,
  TransactionPayload,
  TransactionKey,
  State,
} from "@/lib/types";
import { v4 } from "uuid";
import { makePersistable } from "mobx-persist-store";
import DBController from "mobx-persist-store-idb-adapter";

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
  clientId: string = v4();
  mutationId: number = 0;
  clientTransactions: Transaction[] = [];
  unsentClientTransactions: Transaction[] = [];

  constructor(rootStore: RootStore) {
    const indexedDBStore = new DBController("realtimeSyncEngine", "public", 1);

    makeAutoObservable(this, undefined, { autoBind: true });
    makePersistable(this, {
      name: "RealtimeSyncEnginePublicStorage",
      properties: ["clientState"],
      storage: indexedDBStore,
      stringify: false,
    });
    this.rootStore = rootStore;
  }

  setWebSocket(webSocket: WebSocket | null) {
    this.webSocket = webSocket;
  }

  processTransactions(transactions: Transaction[]) {
    let tmpState = this.serverState;

    for (const serverTransaction of transactions) {
      const conflictingTransaction = this.clientTransactions.find(
        (clientTransaction) =>
          clientTransaction.key === serverTransaction.key &&
          clientTransaction.clientId === serverTransaction.clientId &&
          clientTransaction.mutationId === serverTransaction.mutationId
      );

      if (conflictingTransaction) {
        // If there is a conflicting client transaction, skip the server transaction
        console.warn(
          `Conflict detected for transaction ${serverTransaction.mutationId}. Skipping server transaction.`
        );
      } else {
        tmpState = this.applyTransaction({
          key: serverTransaction.key,
          payload: serverTransaction.payload,
          state: tmpState,
        });
      }
    }

    this.serverState = tmpState;

    for (const transaction of this.unsentClientTransactions) {
      tmpState = this.applyTransaction({
        key: transaction.key,
        payload: transaction.payload,
        state: tmpState,
      });
    }

    // this.clearClientTransactions();

    console.log(
      JSON.stringify(
        {
          unsent: this.unsentClientTransactions.length,
          client: this.clientTransactions.length,
          ct: tmpState.todos?.[0]?.text,
          st: this.serverState.todos?.[0]?.text,
        },
        null,
        2
      )
    );

    this.clientState = tmpState;
  }

  mutate(key: TransactionKey, payload: TransactionPayload) {
    if (!this.webSocket) {
      return;
    }

    const timestamp = Date.now();

    let tmpState = this.clientState;

    tmpState = this.applyTransaction({
      key,
      payload,
      state: tmpState,
    });

    this.clientState = tmpState;

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

  applyTransaction({
    key,
    payload,
    state,
  }: {
    key: TransactionKey;
    payload: TransactionPayload;
    state: State;
  }) {
    if (key === "counter" && typeof state[key] === "number") {
      switch (payload.type) {
        case "GET_COUNTER":
          state[key] = this.setCounter(state[key], payload.value);
          break;

        case "SET_COUNTER":
          state[key] = this.setCounter(state[key], payload.value);
          break;

        case "INCREMENT_COUNTER":
          state[key] = this.incrementCounter(state[key], payload.delta);
          break;

        case "DECREMENT_COUNTER":
          state[key] = this.decrementCounter(state[key], payload.delta);
          break;
      }
    } else if (key === "todos" && Array.isArray(state[key])) {
      switch (payload.type) {
        case "LIST_TODOS":
          state[key] = this.setTodos(state[key], payload.value);
          break;

        case "SET_TODOS":
          state[key] = this.setTodos(state[key], payload.value);
          break;

        case "UPDATE_TODO":
          state[key] = this.updateTodo(state[key], payload.value);
          break;

        case "SET_TODO":
          state[key] = this.setTodo(state[key], payload.value);
          break;

        case "DELETE_TODO":
          state[key] = this.deleteTodo(state[key], payload.id);
          break;
      }
    }

    return state;
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

  setCounter(prev: number, amount: number | undefined) {
    if (amount === undefined) {
      return prev;
    }

    return amount;
  }

  incrementCounter(prev: number, amount = 1) {
    const next = prev + amount;
    return next;
  }

  decrementCounter(prev: number, amount = 1) {
    const next = prev - amount;
    return next;
  }

  setTodos(prev: Todo[], value: Todo[] | undefined) {
    if (value === undefined) {
      return prev;
    }

    return value;
  }

  setTodo(prev: Todo[], value: Todo) {
    const next = [...prev, value];
    return next;
  }

  updateTodo(prev: Todo[], value: Partial<Todo> & Required<Pick<Todo, "id">>) {
    const next = prev.map((todo) =>
      todo.id === value.id ? { ...todo, ...value } : todo
    );
    return next;
  }

  deleteTodo(prev: Todo[], { id }: Pick<Todo, "id">) {
    const next = prev.filter((todo) => todo.id !== id);
    return next;
  }
}
