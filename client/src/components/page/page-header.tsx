import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { RootStoreContext } from "@/stores/root-store";


export const PageHeader = observer(() => {
	const {
		publicStore: {  clientState: {page} },
	} = useContext(RootStoreContext);

	return (
  <header>
    <h1 className="text-2xl mb-4">{page?.name}</h1>
    <p className="mb-4">{page?.description}</p>
  </header>

	)
}
);
