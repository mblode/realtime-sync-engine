import { useCallback, ChangeEvent, useContext } from "react";
import { Input } from "./ui/input";
import { RootStoreContext } from "@/stores/root-store";
import { observer } from "mobx-react-lite";
import { Todo } from "@/lib/types";
import { Checkbox } from "./ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

type Props = {
  item: Todo;
};

export const TodoItem = observer(({ item }: Props) => {
  const {
    publicStore: { mutate },
  } = useContext(RootStoreContext);

  const handleCheckedChange = useCallback(
    (checked: CheckedState) => {
      const completed = checked === "indeterminate" ? false : checked;

      mutate("todos", {
        type: "UPDATE_TODO",
        value: {
          id: item.id,
          completed,
        },
      });
    },
    [item.id, mutate]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      mutate("todos", {
        type: "UPDATE_TODO",
        value: {
          id: item.id,
          text: e.target.value,
        },
      });
    },
    [item.id, mutate]
  );

  return (
    <div className="flex items-center mb-4">
      <Checkbox
        checked={item.completed}
        onCheckedChange={handleCheckedChange}
      />

      <Input type="text" value={item.text || ""} onChange={handleChange} />
    </div>
  );
});
