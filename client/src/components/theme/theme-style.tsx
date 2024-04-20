import { RootStoreContext } from "@/stores/root-store";
import { observer } from "mobx-react-lite";
import { useContext } from "react";

export const ThemeStyle = observer(() => {
	const {
		publicStore: {
			clientState: { theme },
		},
	} = useContext(RootStoreContext);

	return (
		<style>
			{`
	:root {
		--page-background: ${theme?.pageBackground || "#fff"};
		--page-heading-color: ${theme?.pageHeadingColor || "#000"};
		--page-body-color: ${theme?.pageBodyColor || "#000"};
		--block-heading-color: ${theme?.blockHeadingColor || "#000"};
		--block-body-color: ${theme?.blockBodyColor || "#000"};
		--block-background: ${theme?.blockBackground || "#eee"};
	}
	`}
		</style>
	);
});
