import { observer } from "mobx-react-lite";
import { Client } from "../../../../shared/types";


type Props = {client: Client };

export const Cursor = observer(({ client }: Props) => {
  return (
    <div
      key={client.id}
      className="absolute top-0 left-0 size-full transition-opacity pointer-events-none"
    >
      <div
        className="absolute cursor-pointer overflow-auto"
        style={{
          left: client?.cursor?.x,
          top: client?.cursor?.y,
        }}
      >
        <div className="p-1 bg-blue-500 text-white">{client.name}</div>
      </div>
    </div>
  );
});
