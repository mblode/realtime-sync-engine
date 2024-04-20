import { useContext, useEffect } from "react";
import { Cursor } from "./cursor";
import { RootStoreContext } from "@/stores/root-store";
import { observer } from "mobx-react-lite";

export const CursorField = observer(() => {
	const {
		publicStore: { clientId, clientState: {clients}, mutate },
	} = useContext(RootStoreContext);

  useEffect(() => {
    const handler = async ({ pageX, pageY }: { pageX: number; pageY: number }) => {
      await mutate('clients', {
				type: 'UPDATE_CLIENT',
				value: {
					id: clientId,
					cursor: {
						x: pageX,
						y: pageY,
					}
				}
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [clientId, mutate]);

  return (
    <>
      {clients.map((client) => (
        <Cursor client={client} key={client.id} />
      ))}
    </>
  );
});
