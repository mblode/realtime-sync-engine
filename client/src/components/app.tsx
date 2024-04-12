import { useRoom } from "@/lib/use-room";
import { observer } from "mobx-react-lite";
import { CounterForm } from "./counter-form";
import { TodosForm } from "./todos-form";

export const App = observer(() => {
	useRoom({ roomSlug: "e" });

	return (
		<div className="p-4">
			<h1>Realtime Sync Engine</h1>
			<CounterForm />
			<TodosForm />
		</div>
	);
});
