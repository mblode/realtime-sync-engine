import { RootStoreContext } from "@/stores/root-store";
import { observer } from "mobx-react-lite";
import {
	type ChangeEvent,
	type KeyboardEvent,
	useCallback,
	useContext,
	useState,
} from "react";
import { v4 } from 'uuid';
import { TodoItem } from "./todo-item";
import { Input } from "./ui/input";

export const TodosForm = observer(() => {
	const {
		publicStore: { clientState, mutate },
	} = useContext(RootStoreContext);

	const [text, setText] = useState("");

	const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setText(e.target.value);
	}, []);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				mutate("todos", {
					type: "SET_TODO",
					value: {
						id: v4(),
						text,
						completed: false,
						sort: clientState.todos.length + 1,
					},
				});
				setText("");
			}
		},
		[mutate, text, clientState.todos.length],
	);

	return (
		<div>
			<h1>Todo</h1>
			<div className="mb-4">
				<Input
					type="text"
					value={text || ""}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder="New to-do"
				/>
			</div>

			{clientState.todos.map((todo, index) => {
				return <TodoItem key={index} item={todo} />;
			})}
		</div>
	);
});
