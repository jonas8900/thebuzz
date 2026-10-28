import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCrown } from "react-icons/fa";

/**
 * Shared leaderboard component displaying historical score snapshots for a game.
 */
export default function Scoreboard({ scores = [] }) {
  const [selectedScoreIndex, setSelectedScoreIndex] = useState(0);

  useEffect(() => {
    if (Array.isArray(scores) && scores.length > 0) {
      setSelectedScoreIndex(scores.length - 1);
    }
  }, [scores]);

  if (!Array.isArray(scores) || scores.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-400">
        Noch keine abgeschlossenen Spielrunden vorhanden.
      </div>
    );
  }

  const currentResults = scores[selectedScoreIndex]?.results || [];
  const sortedResults = [...currentResults].sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center mt-10 px-4"
    >
      <p className="text-lg mb-6">Hier sind die Spielergebnisse und Punktestände</p>

      <div className="text-center mb-8">
        <select
          value={selectedScoreIndex}
          onChange={(e) => setSelectedScoreIndex(Number(e.target.value))}
          className="bg-gray-700 text-white p-2.5 rounded-lg"
        >
          {scores.map((score, index) => (
            <option key={score._id || index} value={index}>
              Runde {index + 1} –{" "}
              {new Date(score.date).toLocaleString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedResults.length > 0 ? (
          sortedResults.map((score, index) => {
            const isFirstPlace = index === 0;
            const playerName =
              score.player?.username || score.username || "Spieler";
            const itemKey = score.player?._id || score._id || `${playerName}-${index}`;

            return (
              <motion.div
                key={itemKey}
                className={`bg-gray-800 text-white p-6 rounded-lg shadow-lg ${
                  isFirstPlace ? "scale-105 border border-yellow-500/40" : ""
                }`}
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <div className="text-center relative">
                  {isFirstPlace && (
                    <motion.div
                      initial={{ y: 6 }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -top-5 left-1/2 -translate-x-1/2"
                    >
                      <FaCrown className="text-yellow-400 text-3xl" />
                    </motion.div>
                  )}
                  <h2
                    className={`font-semibold mt-2 ${
                      isFirstPlace ? "text-yellow-400 text-2xl" : "text-xl"
                    }`}
                  >
                    {playerName}
                  </h2>
                  <p className="text-lg mt-1">Punkte: {score.points ?? 0}</p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="col-span-full text-gray-400">Keine Ergebnisse für diese Runde verfügbar.</p>
        )}
      </div>
    </motion.div>
  );
}
