import { useCallback, ChangeEvent, useContext } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { RootStoreContext } from "@/stores/root-store";
import { observer } from "mobx-react-lite";
import { TransactionPayload } from "../../../shared/types";

export const CounterForm = observer(() => {
  const {
    publicStore: { clientState, mutate },
  } = useContext(RootStoreContext);

  const handleClick = useCallback(
    (payload: TransactionPayload) => {
      mutate("counter", payload);
    },
    [mutate]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      mutate("counter", {
        type: "SET_COUNTER",
        value: parseInt(e.target.value),
      });
    },
    [mutate]
  );

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center space-x-2 bg-background text-foreground">
        <Button
          onClick={() => handleClick({ type: "DECREMENT_COUNTER", delta: 2 })}
        >
          --
        </Button>
        <Button
          onClick={() => handleClick({ type: "DECREMENT_COUNTER", delta: 1 })}
        >
          -
        </Button>
        <Input
          type="number"
          value={clientState.counter || 0}
          onChange={handleChange}
        />
        <Button
          onClick={() => handleClick({ type: "INCREMENT_COUNTER", delta: 1 })}
        >
          +
        </Button>
        <Button
          onClick={() => handleClick({ type: "INCREMENT_COUNTER", delta: 2 })}
        >
          ++
        </Button>
      </div>
    </div>
  );
});
