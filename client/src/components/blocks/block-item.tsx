
import { observer } from "mobx-react-lite";
import { Block } from "../../../../shared/types";

type Props = {
  block: Block;
};

export const BlockItem = observer(({ block }: Props) => {
  return (
    <div className="size-full bg-block-background p-2 text-block-body-color">
      {block.kind}
    </div>
  );
});
