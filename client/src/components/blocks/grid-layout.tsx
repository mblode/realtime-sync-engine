import { useContext, useMemo } from "react";


import { Layout, ReactGridLayout } from "@fingertip/react-grid-layout";
import { BlockItem } from "./block-item";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "@/stores/root-store";


export const GridLayout = observer(() => {
	const {
		publicStore: { clientState: {blocks}, setActiveBlockId, mutate },
	} = useContext(RootStoreContext);

  const layout = useMemo(() => {
    return blocks.map((block) => {
      return {
        i: block.id,
        x: block.x,
        y: block.y,
        w: block.w,
        h: block.h,
        deg: 0,
      };
    });
  }, [blocks]);

  const children = useMemo(() => {
    return blocks.map((block) => {
      return (
        <div key={block.id} onPointerDown={() => setActiveBlockId(block.id)}>
          <BlockItem block={block} key={block.id} />
        </div>
      );
    });
  }, [blocks, setActiveBlockId]);

  const handleLayoutChange = (layout: Layout) => {
    layout.forEach((layoutItem) => {
      // Retrieve the existing block from your store if needed
      const existingBlock = blocks.find((block) => block.id === layoutItem.i);

      if (!existingBlock || !existingBlock) {
        return;
      }

      const newBlock = {
        ...existingBlock,
        x: layoutItem.x,
        y: layoutItem.y,
        w: layoutItem.w,
        h: layoutItem.h,
      };


			mutate("blocks",  { type: "UPDATE_BLOCK", value: newBlock});
    });
  };

  return (
    <ReactGridLayout
      className="layout"
      layout={layout}
      cols={4}
      rowHeight={30}
      width={500}
      margin={[14, 14, 14, 14]}
      isDraggable
      isResizable
      resizeHandles={["n", "e", "s", "w", "sw", "nw", "se", "ne"]}
      dragTouchDelayDuration={250}
      isDroppable
      containerPadding={[0, 0, 0, 0]}
      onLayoutChange={handleLayoutChange}
    >
      {children}
    </ReactGridLayout>
  );
});
