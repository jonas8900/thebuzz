import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Image from "next/image";
import io from "socket.io-client";
import { usePlayerSocket } from "../context/playerContext";


export default function GamePanel() {
  const router = useRouter();
  const { isReady, query } = router;
  const { x: queryId } = query;
  const { data: session, status } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { players, socket } = usePlayerSocket(); 
  const { data: gameByID, isLoading } = useSWR(
    isReady && queryId ? `/api/gamemechanic/getGameById?x=${queryId}` : null
  );

  useEffect(() => {
    if (gameByID?.players?.length > 0 && session?.user?.id) {
      const playerId = session.user.id;
      const username = session.user.username;

      socket.emit("joinGame", { gameId: queryId, playerId, username });
    }
  }, [gameByID, session]);

  console.log(players);

  // useEffect(() => {
  //   socket.on("activePlayers", ({ gameId, players }) => {
  //     setPlayers(players);
  //   });

  //   return () => {
  //     socket.off("activePlayers");
  //   };
  // }, []);

  return (
    <div className="absolute top-1/2 left-1/2 lg:w-3/4 lg:h-3/4 w-full h-full flex flex-col justify-center items-center border bg-gray-900 rounded-2xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 overflow-hidden text-white">
      {gameByID?.started ? (
        <h1 className="text-2xl">Spiel ist gestartet!</h1>
      ) : (
        <>
          <div className="absolute left-10 top-10 w-1/4 bg-gray-800 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Wartende Spieler</h2>
            {players.length > 0 ? (
              <ul>
                {players.map((player) => (
                  <li key={player._id} className="text-lg text-gray-300">
                    {player.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Lade Spieler...</p>
            )}
          </div>
          <div className="flex flex-col items-center space-y-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-center">
              <motion.img
                src="/images/anker.png"
                alt="Logo"
                width={100}
                height={100}
                className="w-50 h-50 rounded-full"
              />
            </motion.div>
            <p className="mt-4 text-lg animate-pulse">
              Warten auf Spielstart...
            </p>

            <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full w-1/3 bg-[#6447a4]"
                animate={{ x: ["-100%", "300%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <p className="text-sm text-gray-400 mt-4 ">
              Der Admin bereitet das Spiel vor...
            </p>
          </div>
        </>
      )}
    </div>
  );
}
