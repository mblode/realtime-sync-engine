import { useCallback, useContext } from "react";
import { InputField } from "../ui/input-field";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/root-store";
import { v4 } from "uuid";

export const AddBlockForm = observer(() => {
	const {
		publicStore: { mutate },
	} = useContext(RootStoreContext);

  const handleSubmit = useCallback((_key: string, value: string) => {
		mutate("blocks", {
			type: "SET_BLOCK",
			value: {
				id: v4(),
				kind: value,
			},
		});
  }, []);


  return (
    <div>
          <InputField
      initial=""
      placeholder="What kind of block?"
      name="kind"
      onSubmit={handleSubmit}
    />
    </div>
  );
});
