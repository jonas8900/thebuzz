import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";
import Loading from "@/components/Status/Loading";
import { usePlayerSocket } from "@/components/context/playerContext";
import { FaCrown } from "react-icons/fa";


export default function GameStatistic() {
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { data: session } = useSession();
    const { data, isLoading, error } = useSWR("/api/game/getChosenGame");
    const [game, setGame] = useState(null);
    const {  socket } = usePlayerSocket();
    const [sortedQuestions, setSortedQuestions] = useState([]);
    const [selectedScoreIndex, setSelectedScoreIndex] = useState(0);


    //refresh game
    useEffect(() => {
      if (!socket) return;
        const gameId = data?.chosenGame?._id;
    
      function handleGameUpdate ({ game: updatedGame }) {
        setGame(updatedGame);
      };
    
      socket.on("gameUpdated", handleGameUpdate);
      socket.emit("getUpdatedGame", { gameId });
    
      return () => {
        socket.off("gameUpdated", handleGameUpdate);
      };
    }, [socket, data]);
  
    if(!game) {
      setGame(data?.chosenGame);
    }

    function handleScoreChange(event) {
        setSelectedScoreIndex(Number(event.target.value));
    }
  

  if (isLoading) return <Loading />;
  if (!session) {
    router.push("/auth/login");
    return null;
  }

  if (error) return <div>Error loading game data.</div>;
  console.log(game);
  console.log(game)

  return (
    <div className="relative bg-gray-900 text-white py-12 px-6">
      {/* Tribüne Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold">Quiz-Spiel Statistiken</h1>
        <p className="text-lg">Hier sind die Spielergebnisse und Punktestände</p>
      </motion.div>

      <div className="text-center mb-6">
        <select
          value={selectedScoreIndex}
          onChange={handleScoreChange}
          className="bg-gray-700 text-white p-2 rounded"
        >
          {game && game.scores?.map((score, index) => (
            <option key={index} value={index}>
              Score {index + 1} - {new Date(score.date).toLocaleString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: false
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {game && game?.scores?.length > 0 ? (
                game.scores[selectedScoreIndex].results
                .sort((a, b) => b.points - a.points) 
                .map((score, index) => {

                    const player = game?.players.find(p => 
                        score.player === p?.playerId.toString()
                      );

                    const isFirstPlace = index === 0;


                    return (
                        <motion.div
                        key={score.player}
                        className={`bg-gray-800 p-6 rounded-lg shadow-lg ${isFirstPlace ? 'scale-110' : ''}`} // Vergrößern für den ersten Platz
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="text-center">
                          {isFirstPlace && (
                            <motion.div
                              initial={{ y: -5 }}
                              animate={{ y: [0, -3, 0] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,

                              }}
                              className="absolute top-0 left-1/2 transform -translate-x-1/2"
                            >
                              <FaCrown className="text-yellow-400 text-3xl" />
                            </motion.div>
                          )}
                          <h2 className={`text-xl font-semibold ${isFirstPlace ? 'text-yellow-500 text-3xl' : ''}`}>{player.username}</h2>
                          <p className="text-lg">Punkte: {score.points}</p>
                        </div>
                      </motion.div>
                    );
                })
            ) : (
                <div className="col-span-full text-center text-xl">Keine Spieler gefunden</div>
            )}

      </div>

      <div className="mt-10 text-center">
      
        {/* {showExplain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4 text-lg text-gray-300"
          >
            <p>
              Diese Seite zeigt die Punktestände der Spieler während des Spiels. Die
              Spieler werden in einer Tribünen-ähnlichen Ansicht angezeigt. Du kannst
              auch eine Erklärung zur Funktionsweise des Spiels einblenden.
            </p>
          </motion.div>
        )} */}
      </div>

      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}
    </div>
  );
}
