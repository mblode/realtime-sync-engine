import { observer } from "mobx-react-lite";
import { InputField } from "../ui/input-field";
import { Page } from "../../../../shared/types";
import { useContext } from "react";
import { RootStoreContext } from "@/stores/root-store";


export const PageForm = observer(() => {
	const {
		publicStore: { clientState: {page}, mutate },
	} = useContext(RootStoreContext);

  const handleSave = (key: string, value: string) => {
    mutate('page', { type: 'UPDATE_PAGE', value: {[key as keyof Page]: value }});
  };

  return (
    <div>
      <InputField
        initial={page?.name || ""}
        name="name"
        onSubmit={handleSave}
        onBlur={handleSave}
      />

      <InputField
        initial={page?.description || ""}
        name="description"
        onSubmit={handleSave}
        onBlur={handleSave}
      />
    </div>
  );
});
