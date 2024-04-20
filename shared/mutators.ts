import {
	decrementCounter,
	getCounter,
	incrementCounter,
	setCounter,
} from "./counter";
import { deleteTodo, listTodos, setTodo, setTodos, updateTodo } from "./todos";
import {
	deleteClient,
	listClients,
	setClient,
	setClients,
	updateClient,
} from "./clients";
import {
	deleteBlock,
	listBlocks,
	setBlock,
	setBlocks,
	updateBlock,
} from "./blocks";
import { initTheme, getTheme, updateTheme } from "./theme";
import { initPage, getPage, updatePage } from "./page";

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

	// blocks
	listBlocks,
	setBlocks,
	setBlock,
	updateBlock,
	deleteBlock,

	// theme
	initTheme,
	getTheme,
	updateTheme,

	// page
	initPage,
	getPage,
	updatePage,

	// clients
	listClients,
	setClients,
	setClient,
	updateClient,
	deleteClient,
};
