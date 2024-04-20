
import { observer } from "mobx-react-lite";
import { Theme } from "../../../../shared/types";
import { InputField } from "../ui/input-field";
import { useContext } from "react";
import { RootStoreContext } from "@/stores/root-store";



export const ThemeForm = observer(() => {
	const {
		publicStore: { clientState: {theme}, mutate },
	} = useContext(RootStoreContext);

  const handleSave = (key: string, value: string) => {
    mutate('theme', { type: 'UPDATE_THEME', value: {[key as keyof Theme]: value }});
  };

  return (
    <div>
      <InputField
        initial={theme?.pageBackground || ""}
        name="pageBackground"
        onSubmit={handleSave}
        onBlur={handleSave}
        type="color"
      />

      <InputField
        initial={theme?.pageBodyColor || ""}
        name="pageBodyColor"
        onSubmit={handleSave}
        onBlur={handleSave}
        type="color"
      />

      <InputField
        initial={theme?.blockBackground || ""}
        name="blockBackground"
        onSubmit={handleSave}
        onBlur={handleSave}
        type="color"
      />

      <InputField
        initial={theme?.blockBodyColor || ""}
        name="blockBodyColor"
        onSubmit={handleSave}
        onBlur={handleSave}
        type="color"
      />
    </div>
  );
});
