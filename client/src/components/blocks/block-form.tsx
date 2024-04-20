import { useContext, useMemo } from "react";
import { Page } from "../../../../shared/types";
import { InputField } from "../ui/input-field";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/root-store";

export const BlockForm = observer(() => {
	const {
		publicStore: { clientState: {blocks}, mutate, activeBlockId },
	} = useContext(RootStoreContext);

  const handleSave = (key: string, value: string) => {
		if (!activeBlockId) {
			return
		}

    mutate("blocks",  { type: "UPDATE_BLOCK", value: {id: activeBlockId, [key as keyof Page]: value }});
  };

  const activeBlock = useMemo(() => {
    return (blocks || []).find((block) => block.id === activeBlockId);
  }, [activeBlockId, blocks]);

  return (
    <div>
      <InputField
        initial={activeBlock?.kind || ""}
        name="kind"
        onSubmit={handleSave}
        onBlur={handleSave}
      />
    </div>
  );
});
