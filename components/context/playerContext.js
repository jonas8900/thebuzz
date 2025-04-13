import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const PlayerSocketContext = createContext();

export const socket = io(
    process.env.NEXT_PUBLIC_SERVER_URL || "https://dein-server-url"
);

export default function PlayerSocketProvider({ children }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("activePlayers", ({ players }) => {
      setPlayers(players);
    });

    return () => {
      socket.off("activePlayers");
    };
  }, []);

  return (
    <PlayerSocketContext.Provider value={{ players, socket }}>
      {children}
    </PlayerSocketContext.Provider>
  );
};

export const usePlayerSocket = () => useContext(PlayerSocketContext);
