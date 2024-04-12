import { useEffect, useCallback, useContext } from "react";
import { RootStoreContext } from "@/stores/root-store";
import { Transaction } from "../../../shared/types";
import { BATCH_INTERVAL_IN_MS } from "./constants";

type Props = {
  roomSlug: string;
};

export const useRoom = ({ roomSlug }: Props) => {
  const {
    publicStore: {
      setWebSocket,
      processTransactions,
      webSocket,
      unsentClientTransactions,
      clearUnsentClientTransactions,
      appendClientTransactions,
    },
  } = useContext(RootStoreContext);

  const join = useCallback(() => {
    const protocol =
      document.location.protocol === "http:" ? "ws://" : "wss://";
    const url = `${protocol}${
      import.meta.env.VITE_WS_HOSTNAME
    }/${roomSlug}/websocket`;

    const ws = new WebSocket(url);

    let rejoined = false;
    const startTime = Date.now();

    const rejoin = async () => {
      if (!rejoined) {
        rejoined = true;
        setWebSocket(null);
        const timeSinceLastJoin = Date.now() - startTime;
        if (timeSinceLastJoin < 10000) {
          await new Promise((resolve) =>
            setTimeout(resolve, 10000 - timeSinceLastJoin)
          );
        }
        join();
      }
    };

    ws.addEventListener("open", () => {
      setWebSocket(ws);
    });

    ws.addEventListener("message", (event) => {
      const transactions: Transaction[] = JSON.parse(event.data);
      processTransactions(transactions);
    });

    ws.addEventListener("close", (event) => {
      console.log("WebSocket closed, reconnecting:", event.code, event.reason);
      rejoin();
    });

    ws.addEventListener("error", (event) => {
      console.log("WebSocket error, reconnecting:", event);
      rejoin();
    });
  }, [processTransactions, roomSlug, setWebSocket]);

  useEffect(() => {
    join();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!webSocket || unsentClientTransactions.length === 0) {
        return;
      }

      webSocket.send(JSON.stringify(unsentClientTransactions));
      appendClientTransactions(unsentClientTransactions);
      clearUnsentClientTransactions();
    }, BATCH_INTERVAL_IN_MS);

    return () => clearInterval(intervalId);
  }, [
    appendClientTransactions,
    clearUnsentClientTransactions,
    unsentClientTransactions,
    webSocket,
  ]);
};
