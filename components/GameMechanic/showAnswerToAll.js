import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { usePlayerSocket } from "../context/playerContext";
import ErrorMessage from "../Toast/ErrorMessage";
import SuccessMessage from "../Toast/SuccessMessage";

export default function ShowAnswerToAll({
  answer,
  players = [],
  onClick,
  isAdmin,
  question,
  game,
}) {
  const confettiRef = useRef(null);
  const correctAnswerIndexInMultiple = parseInt(question?.correctanswer, 10);
  const correctanswer = question?.correctanswer;
  const correctAnswerInMultiple =
    question?.answers?.[correctAnswerIndexInMultiple];

  const playersWithCorrectAnswerInMultiple = players.filter(
    (player) => player.answer === correctAnswerInMultiple
  );
  const playersWithCorrectTrueFalse = players.filter(
    (player) => String(player.answer) === String(correctanswer)
  );

  // Format the displayed solution depending on question mode
  const formattedSolution =
    question?.mode === "multiple"
      ? correctAnswerInMultiple
      : question?.mode === "truefalse"
      ? String(correctanswer) === "true"
        ? "Wahr"
        : "Falsch"
      : correctanswer;

  const [pointsGivenTo, setPointsGivenTo] = useState([]);
  const { socket } = usePlayerSocket();
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (confettiRef.current) {
      const duration = 200;
      const animationEnd = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, []);

  function handleSetPointsToUser(playerId) {
    if (pointsGivenTo.includes(playerId)) {
      setShowError(true);
      setToastMessage("Spieler hat bereits Punkte erhalten!");
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 3000);
      return;
    }

    setPointsGivenTo((prev) => [...prev, playerId]);
    socket.emit("setPointsToUser", {
      gameId: game._id,
      playerId,
      points: question.points,
    });
    setShowSuccess(true);
    setToastMessage("Punkte vergeben! 🎉");
    setTimeout(() => {
      setShowSuccess(false);
      setToastMessage("");
    }, 3000);
  }

  return (
    <div
      ref={confettiRef}
      className="absolute h-full w-full z-50 top-0 left-0 flex flex-col items-center justify-center bg-gray-900 px-4"
    >
      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}
      {!game?.finished && (
        <motion.div
          className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-violet-600"
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
        >
          <CheckCircle className="text-green-400 w-14 h-14 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl text-gray-800 dark:text-white mb-4">
            🎉 Richtige Antwort: <br />
            <span className="text-3xl font-bold text-blue-400 mt-1 inline-block">
              {formattedSolution}
            </span>
          </h1>

          {question.mode === "multiple" && (
            <>
              {answer && (
                <p className="text-2xl text-violet-500 dark:text-white font-semibold mb-6">
                  {answer}
                </p>
              )}

              <h2 className="text-lg font-medium text-gray-700 dark:text-white mb-2">
                Diese Spieler lagen richtig:
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {playersWithCorrectAnswerInMultiple.length > 0 ? (
                  playersWithCorrectAnswerInMultiple.map((player) => (
                    <span
                      key={player.playerId || player.username}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium shadow"
                    >
                      {player.username}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                    Niemand hat&apos;s gewusst 😅
                  </p>
                )}
              </div>
            </>
          )}

          {question.mode === "truefalse" && (
            <>
              {answer && (
                <p className="text-2xl text-violet-500 dark:text-white font-semibold mb-6">
                  {answer}
                </p>
              )}

              <h2 className="text-lg font-medium text-gray-700 dark:text-white mb-2">
                Diese Spieler lagen richtig:
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {playersWithCorrectTrueFalse.length > 0 ? (
                  playersWithCorrectTrueFalse.map((player) => (
                    <span
                      key={player.playerId || player.username}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium shadow"
                    >
                      {player.username}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                    Niemand hat&apos;s gewusst 😅
                  </p>
                )}
              </div>
            </>
          )}

          {(question.mode === "open" || question.mode === "picture") && (
            <div className="text-center mb-6">
              <p className="text-base text-gray-300 mt-2">
                Welcher Spieler war am nächsten dran?
              </p>
            </div>
          )}

          {question.mode === "buzzer" && question?.playeranswers?.[0] && (
            <div className="text-center mb-6">
              <p className="text-base text-gray-300 mt-2">
                <strong>{question.playeranswers[0].username}</strong> war am
                schnellsten und hat die richtige Antwort gegeben!
              </p>
            </div>
          )}

          {isAdmin && (
            <>
              {question.mode === "multiple" && (
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-4 flex flex-col gap-1">
                  <p className="mb-2">Punkteverteilung:</p>
                  {playersWithCorrectAnswerInMultiple.length > 0 ? (
                    playersWithCorrectAnswerInMultiple.map((player) => (
                      <span
                        key={player.playerId || player.username}
                        className="px-3 py-1 text-green-800 dark:text-green-200 text-base font-medium"
                      >
                        {player.username} erhält {question.points} Punkte
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                      Niemand hat&apos;s gewusst 😅
                    </p>
                  )}
                </div>
              )}

              {question.mode === "truefalse" && (
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-4 flex flex-col gap-1">
                  <p className="mb-2">Punkteverteilung:</p>
                  {playersWithCorrectTrueFalse.length > 0 ? (
                    playersWithCorrectTrueFalse.map((player) => (
                      <span
                        key={player.playerId || player.username}
                        className="px-3 py-1 text-green-800 dark:text-green-200 text-base font-medium"
                      >
                        {player.username} erhält {question.points} Punkte
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                      Niemand hat&apos;s gewusst 😅
                    </p>
                  )}
                </div>
              )}

              {(question.mode === "open" || question.mode === "picture") && (
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-4 flex flex-col gap-2">
                  <p className="mb-2">Punkteverteilung (Klicken zum Vergeben):</p>
                  {players.map((player) => (
                    <button
                      key={player.playerId || player.username}
                      className={`px-6 py-3 cursor-pointer bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full text-lg font-semibold shadow-md 
                        hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out
                        ${
                          pointsGivenTo.includes(player.playerId)
                            ? "bg-green-600 text-black dark:bg-green-600 dark:text-black cursor-not-allowed"
                            : ""
                        }`}
                      onClick={() => handleSetPointsToUser(player.playerId)}
                    >
                      {player.username} mit der Antwort: {player.answer}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={onClick}
                className="mt-4 px-6 py-3 cursor-pointer bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300"
              >
                Nächste Frage
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
