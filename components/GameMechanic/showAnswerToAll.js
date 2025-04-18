import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function ShowAnswerToAll({ answer, players, onClick, isAdmin, question }) {
    const confettiRef = useRef(null);
    const correctAnswerIndexInMultiple = parseInt(question.correctanswer);
    const correctAnswerInMultiple = question.answers[correctAnswerIndexInMultiple];
    const playerwithCorrectAnswer = players.filter((player) => player.answer === correctAnswerInMultiple);


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





  return (
    <div
      ref={confettiRef}
      className="absolute h-full w-full z-50 top-0 left-0 flex flex-col items-center justify-center bg-gray-900 px-4"
    >
      <motion.div
        className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-violet-600"
        initial={{ y: 80, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
      >
        <CheckCircle className="text-green-400 w-14 h-14 mx-auto mb-4 animate-bounce" />
        <h1 className="text-2xl text-gray-800 dark:text-white mb-2">
          🎉 Richtige Antwort: <br></br><span className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{correctAnswerInMultiple}</span>
        </h1>


        {question.mode === "multiple" ? (
        <>
            <p className="text-2xl text-violet-500 dark:text-white font-semibold mb-6">
            {answer}
            </p>

            <h2 className="text-lg font-medium text-gray-700 dark:text-white mb-2">
            Diese Spieler lagen richtig:
            </h2>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
            {playerwithCorrectAnswer.length > 0 ? (
                playerwithCorrectAnswer
                    .map((player) => (
                    <span
                        key={player.username}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium shadow"
                    >
                        {player.username}
                    </span>
                    ))
                ) : (
                <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                    Niemand hat's gewusst 😅
                </p>
                )}
            </div>
          </>
          ) : (
            <></>
          )}


        {isAdmin && (
          <>
            <div className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                <p className="mb-4">Punkteverteilung:</p>
                {playerwithCorrectAnswer.length > 0 ? (
                playerwithCorrectAnswer
                    .map((player) => (
                    <span
                        key={player.username}
                        className="px-3 py-1 pt-4 text-green-800 dark:text-green-200  text-md font-medium "
                    >
                        {player.username} erhält {question.points} Punkte
                    </span>
                    ))
                ) : (
                <p className="text-sm text-gray-500 dark:text-gray-300 italic">
                    Niemand hat's gewusst 😅
                </p>
                )}
            </div>
       

          <button
            onClick={onClick}
            className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300"
          >
            Nächste Frage
          </button>
        </>
         )}
      </motion.div>
    </div>
  );
}
