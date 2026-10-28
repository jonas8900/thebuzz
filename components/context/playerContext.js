import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const PlayerSocketContext = createContext();

/**
 * Shared Socket.IO client instance.
 * Uses autoConnect: false so public marketing pages do not open idle WebSocket connections.
 * Connects to the current origin automatically 
 */
export const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || undefined, {
  path: "/socket.io",
  autoConnect: false,
});

export default function PlayerSocketProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    const isGameRoute = router.pathname.startsWith("/game");
    const isAuthenticated = status === "authenticated";

    if ((isGameRoute || isAuthenticated) && !socket.connected) {
      socket.connect();
    }
  }, [router.pathname, status]);

  useEffect(() => {
    const handleActivePlayers = ({ players: updatedPlayers }) => {
      setPlayers(updatedPlayers || []);
    };

    socket.on("activePlayers", handleActivePlayers);

    return () => {
      socket.off("activePlayers", handleActivePlayers);
    };
  }, []);

  return (
    <PlayerSocketContext.Provider value={{ players, socket }}>
      {children}
    </PlayerSocketContext.Provider>
  );
}

export const usePlayerSocket = () => useContext(PlayerSocketContext);
