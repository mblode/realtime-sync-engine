import { Todo } from "./types";
import { WriteTransaction } from "./write-transaction";

export const listTodos = async (tx: WriteTransaction, key: string) => {
	const value: Todo[] = (await tx.get(key)) || [];
	return value;
};

export const setTodos = async (
	tx: WriteTransaction,
	key: string,
	value: Todo[] | undefined,
) => {
	const prev: Todo[] = (await tx.get(key)) || [];

	if (value === undefined) {
		return prev;
	}

	await tx.set(key, value);
	return value;
};

export const setTodo = async (
	tx: WriteTransaction,
	key: string,
	value: Todo,
) => {
	const prev: Todo[] = (await tx.get(key)) || [];
	const next = [...prev, value];
	await tx.set(key, next);
	return next;
};

export const updateTodo = async (
	tx: WriteTransaction,
	key: string,
	value: Partial<Todo> & Required<Pick<Todo, "id">>,
) => {
	const prev: Todo[] = (await tx.get(key)) || [];
	const next = prev.map((todo) =>
		todo.id === value.id ? { ...todo, ...value } : todo,
	);
	await tx.set(key, next);
	return next;
};

export const deleteTodo = async (
	tx: WriteTransaction,
	key: string,
	{ id }: Pick<Todo, "id">,
) => {
	const prev: Todo[] = (await tx.get(key)) || [];
	const next = prev.filter((todo) => todo.id !== id);
	await tx.set(key, next);
	return next;
};
