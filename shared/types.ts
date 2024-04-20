type TransactionLocation = "client" | "server";
type TransactionReason = "initial" | "rebase" | "authoritative";

export type TransactionKey = keyof State;

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
	  }
	| {
			type: "SET_BLOCKS";
			value: Block[];
	  }
	| {
			type: "SET_BLOCK";
			value: Block;
	  }
	| {
			type: "UPDATE_BLOCK";
			value: Partial<Block> & Required<Pick<Block, "id">>;
	  }
	| {
			type: "DELETE_BLOCK";
			id: Pick<Block, "id">;
	  }
	| {
			type: "LIST_BLOCKS";
			value: Block[];
	  }
	| {
			type: "SET_CLIENTS";
			value: Client[];
	  }
	| {
			type: "SET_CLIENT";
			value: Client;
	  }
	| {
			type: "UPDATE_CLIENT";
			value: Partial<Client> & Required<Pick<Client, "id">>;
	  }
	| {
			type: "DELETE_CLIENT";
			id: Pick<Client, "id">;
	  }
	| {
			type: "LIST_CLIENTS";
			value: Client[];
	  }
	| {
			type: "INIT_PAGE";
	  }
	| {
			type: "GET_PAGE";
			value: Page;
	  }
	| {
			type: "UPDATE_PAGE";
			value: Partial<Page>;
	  }
	| {
			type: "INIT_THEME";
	  }
	| {
			type: "GET_THEME";
			value: Theme;
	  }
	| {
			type: "UPDATE_THEME";
			value: Partial<Theme>;
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

export type Theme = {
	pageBackground: string;
	pageHeadingColor: string;
	pageBodyColor: string;
	blockHeadingColor: string;
	blockBodyColor: string;
	blockBackground: string;
};

export type Block = {
	id: string;
	kind: string;
	x: number;
	y: number;
	h: number;
	w: number;
};

export type Client = {
	id: string;
	name: string;
	cursor: { x: number; y: number } | null;
};

export type Page = {
	name: string;
	description: string;
};

export type State = {
	counter: number;
	todos: Todo[];
	clients: Client[];
	blocks: Block[];
	theme: Theme | null;
	themeInit: boolean;
	page: Page | null;
	pageInit: boolean;
};
