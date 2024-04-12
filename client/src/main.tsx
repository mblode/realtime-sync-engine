import ReactDOM from "react-dom/client";
import { App } from "./components/app.tsx";
import "./globals.css";
import { RootStoreProvider } from "./stores/root-store-provider.tsx";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<RootStoreProvider>
		<App />
	</RootStoreProvider>,
);
