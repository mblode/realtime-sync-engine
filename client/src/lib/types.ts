type TransactionLocation = "client" | "server";
type TransactionReason = "initial" | "rebase" | "authoritative";

export type TransactionKey = "counter" | "todos";

export type TransactionPayload =
  | {
      type: "INCREMENT_COUNTER";
      delta: number;
    }
  | {
      type: "DECREMENT_COUNTER";
      delta: number;
    }
  | {
      type: "SET_COUNTER";
      value: number;
    }
  | {
      type: "GET_COUNTER";
      value: number;
    }
  | {
      type: "SET_TODOS";
      value: Todo[];
    }
  | {
      type: "SET_TODO";
      value: Todo;
    }
  | {
      type: "UPDATE_TODO";
      value: Partial<Todo> & Required<Pick<Todo, "id">>;
    }
  | {
      type: "DELETE_TODO";
      id: Pick<Todo, "id">;
    }
  | {
      type: "LIST_TODOS";
      value: Todo[];
    };

export type Transaction = {
  roomId?: string;
  clientId: string;
  location: TransactionLocation;
  reason: TransactionReason;
  mutationId: number;
  timestamp: number;
  key: TransactionKey;
  payload: TransactionPayload;
};

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  sort: number;
};

export type State = {
  counter: number;
  todos: Todo[];
};
