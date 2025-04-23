import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { set } from "mongoose";
import { usePlayerSocket } from "../context/playerContext";
import ErrorMessage from "../Toast/ErrorMessage";
import SuccessMessage from "../Toast/SuccessMessage";

export default function ShowAnswerToAll({
  answer,
  players,
  onClick,
  isAdmin,
  question,
  game,
  onClickRestart,
}) {
  const confettiRef = useRef(null);
  const correctAnswerIndexInMultiple = parseInt(question.correctanswer);
  const correctanswer = question.correctanswer;
  const correctAnswerInMultiple =
    question.answers[correctAnswerIndexInMultiple];
  const playerwithCorrectAnswerInMultiple = players.filter(
    (player) => player.answer === correctAnswerInMultiple
  );
  const PlayerWithCorrectAnwser = players.filter(
    (player) => player.answer === correctanswer
  );

  const [pointsGivenTo, setPointsGivenTo] = useState([]);
  const { socket } = usePlayerSocket();
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (confettiRef.current) {
      const duration = 2 * 100;
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

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  function handleSetPointsToUser(playerId) {
    console.log("Punkte vergeben an Spieler:", playerId);
    console.log("Punkte vergeben an Spieler:", question.points);

    setPointsGivenTo((prev) => [...prev, playerId]);
    if (pointsGivenTo.includes(playerId)) {
      setShowError(true);
      setToastMessage("Spieler hat bereits Punkte erhalten!");
      return;
    }
    console.log("hier komm ich nicht mehr hin");
    socket.emit("setPointsToUser", {
      gameId: game._id,
      playerId,
      points: question.points,
    });
    setShowSuccess(true);
    setToastMessage("Punkte vergeben! 🎉");
  }

  return (
    <div
      ref={confettiRef}
      className="absolute h-full w-full z-50 top-0 left-0 flex flex-col items-center justify-center bg-gray-900 px-4">
      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}
      {!game?.finished && (
        <motion.div
          className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-violet-600"
          initial={{ y: 80, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}>
          <CheckCircle className="text-green-400 w-14 h-14 mx-auto mb-4 animate-bounce" />
          <h1 className="text-2xl text-gray-800 dark:text-white mb-2">
            🎉 Richtige Antwort: <br></br>
            <span className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {correctAnswerInMultiple}
            </span>
          </h1>

          {question.mode === "multiple" && (
            <>
              <p className="text-2xl text-violet-500 dark:text-white font-semibold mb-6">
                {answer}
              </p>

              <h2 className="text-lg font-medium text-gray-700 dark:text-white mb-2">
                Diese Spieler lagen richtig:
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {playerwithCorrectAnswerInMultiple.length > 0 ? (
                  playerwithCorrectAnswerInMultiple.map((player) => (
                    <span
                      key={player.username}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium shadow">
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
              <p className="text-2xl text-violet-500 dark:text-white font-semibold mb-6">
                {answer}
              </p>

              <h2 className="text-lg font-medium text-gray-700 dark:text-white mb-2">
                Diese Spieler lagen richtig:
              </h2>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {PlayerWithCorrectAnwser.length > 0 ? (
                  PlayerWithCorrectAnwser.map((player) => (
                    <span
                      key={player.username}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium shadow">
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

          {question.mode === "open" && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Korrekte Antwort: <br></br>
                  <span className="text-blue-600 dark:text-blue-400 ml-2">
                    {correctanswer}
                  </span>
                </h2>

                <p className="text-md text-gray-600 dark:text-gray-300 mt-4">
                  Welcher Spieler war am nächsten dran?
                </p>
              </div>
            </>
          )}

          {isAdmin && (
            <>
              {question.mode === "multiple" && (
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                  <p className="mb-4">Punkteverteilung:</p>
                  {playerwithCorrectAnswerInMultiple.length > 0 ? (
                    playerwithCorrectAnswerInMultiple.map((player) => (
                      <span
                        key={player.username}
                        className="px-3 py-1 pt-4 text-green-800 dark:text-green-200  text-md font-medium ">
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
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                  <p className="mb-4">Punkteverteilung:</p>
                  {PlayerWithCorrectAnwser.length > 0 ? (
                    PlayerWithCorrectAnwser.map((player) => (
                      <span
                        key={player.username}
                        className="px-3 py-1 pt-4 text-green-800 dark:text-green-200  text-md font-medium ">
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
              {question.mode === "open" && (
                <div className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                  <p className="mb-4">Punkteverteilung:</p>
                  {players.map((player) => (
                    <button
                      key={player.username}
                      className={`px-6 py-3 cursor-pointer bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full text-lg font-semibold shadow-md 
                        hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-105 transition-all duration-300 ease-in-out
                        ${
                          pointsGivenTo.includes(player.playerId)
                            ? "bg-green-600 text-black dark:bg-green-600 dark:text-black cursor-not-allowed"
                            : ""
                        }
                        `}
                      onClick={() => handleSetPointsToUser(player.playerId)}>
                      {player.username}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={onClick}
                className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300">
                Nächste Frage
              </button>
            </>
          )}
        </motion.div>
      )}
      {/* // ) : (
      //   <motion.div
      //     className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl text-center"
      //     initial={{ opacity: 0 }}
      //     animate={{ opacity: 1 }}
      //     transition={{ duration: 0.5 }}
      //   >
      //       <h2 className="text-3xl font-bold mb-6">Spiel beendet 🎉</h2>
      //       <p className="text-lg text-gray-300 mb-4">Vielen Dank fürs Mitspielen!</p>
      //       <p className="text-md text-gray-400">Der Admin kann nun ein neues Spiel starten oder das aktuelle auswerten.</p>

      //       {isAdmin && (
      //         <button
      //           onClick={onClickRestart}
      //           className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300"
      //         >
      //           Neues Spiel starten
      //         </button>
      //       )}
      //   </motion.div>

      // )} */}
    </div>
  );
}
