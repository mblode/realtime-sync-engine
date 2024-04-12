import {
	decrementCounter,
	getCounter,
	incrementCounter,
	setCounter,
} from "./counter";
import { deleteTodo, listTodos, setTodo, setTodos, updateTodo } from "./todos";

export const mutators = {
	// counter
	getCounter,
	setCounter,
	incrementCounter,
	decrementCounter,
	// todos
	listTodos,
	setTodos,
	setTodo,
	updateTodo,
	deleteTodo,
};
