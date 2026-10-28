import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Loading from "@/components/Status/Loading";
import { usePlayerSocket } from "@/components/context/playerContext";
import Scoreboard from "@/components/GameMechanic/Scoreboard";

export default function GameStatistic() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data, isLoading, error } = useSWR("/api/game/getChosenGame");
  const [game, setGame] = useState(null);
  const { socket } = usePlayerSocket();

  useEffect(() => {
    if (!socket || !game?._id) return;

    const gameId = game._id;

    function handleGameUpdate({ game: updatedGame }) {
      setGame(updatedGame);
    }

    socket.on("gameUpdated", handleGameUpdate);
    socket.emit("getUpdatedGame", { gameId });

    return () => {
      socket.off("gameUpdated", handleGameUpdate);
    };
  }, [socket, game?._id]);

  useEffect(() => {
    if (data) {
      setGame(data.chosenGame);
    }
  }, [data]);

  if (isLoading) return <Loading />;
  if (!session) {
    router.push("/auth/login");
    return null;
  }
  if (!game) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-gray-500">
          Keine Spiele gefunden, lege erst Spiele an um Statistiken zu sehen
        </p>
      </div>
    );
  }

  if (error) return <div>Fehler beim Laden der Spieldaten.</div>;

  return (
    <div className="relative dark:bg-gray-900 dark:text-white py-12 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-4xl font-bold">Quiz-Spiel Statistiken</h1>
      </motion.div>

      <Scoreboard scores={game?.scores || []} />
    </div>
  );
}
