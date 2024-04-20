import { useRoom } from "@/lib/use-room";
import { observer } from "mobx-react-lite";
import { CounterForm } from "./counter/counter-form";
import { TodosForm } from "./todos/todos-form";
import { PageHeader } from "./page/page-header";
import { ThemeStyle } from "./theme/theme-style";
import { CursorField } from "./clients/cursor-field";
// import { GridLayout } from "./blocks/grid-layout";
import { ThemeForm } from "./theme/theme-form";
import { PageForm } from "./page/page-form";
import { BlockForm } from "./blocks/block-form";

export const App = observer(() => {
	useRoom({ roomSlug: "e" });

	return (
		<>
			<ThemeStyle />
			<div className="p-4">
				<h1>Realtime Sync Engine</h1>
				<CounterForm />
				<TodosForm />

				<PageHeader />

				{/* <GridLayout /> */}

				<ThemeForm />
				<PageForm />
				<BlockForm />

				{/* <CursorField /> */}
			</div>
		</>
	);
});
