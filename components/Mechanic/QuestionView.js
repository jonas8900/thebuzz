import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import ShowAnswerToAll from "../GameMechanic/showAnswerToAll";
import { useSession } from "next-auth/react";
import { usePlayerSocket } from "../context/playerContext";

export default function QuestionView({ currentQuestionIndex, questions, game, showrightAnswer, onClickRestart, setShowBuzzeredUser, showBuzzeredUser }) {
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const { data: session } = useSession();
  const { socket } = usePlayerSocket();

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    console.log(showBuzzeredUser)
  }, [socket]);



  function toggleAnswer(playerId) {
    setVisibleAnswers((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };



  function handleShowAnswer() {
    socket.emit("showRightAnswer", { gameId: game._id, showAnswer: true });
  }
  
  function handleShowNextQuestion() {
    socket.emit("showRightAnswer", { gameId: game._id, showAnswer: false });
    setVisibleAnswers({});
    socket.emit("nextQuestion", { gameId: game._id, questionIndex: currentQuestionIndex + 1 });

  }
  
  function handleBuzzerAnswer(bool) {

      socket.emit("buzzerAnswer", { gameId: game._id, username: showBuzzeredUser, answer: bool });


  }
  
  if (!currentQuestion) {
    return <p className="text-center text-red-500">Keine Fragen vorhanden!</p>;
  }

  console.log(showBuzzeredUser);

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gray-950">
      {!game?.finished ? (
      <motion.div
        className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
         <span className="text-base flex items-center mb-6 ">Frage {currentQuestionIndex + 1} <span className="text-violet-400"> / Modus {currentQuestion.mode}</span></span> 
         {currentQuestion.question}
        </h2>

       
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.mode === "open" && (
            <>
            {currentQuestion?.playeranswers.map((answer) => (
            <div key={answer.playerId} className="mb-4">
              <button
                onClick={() => toggleAnswer(answer.playerId)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700"
              >
                {answer.username}
                {visibleAnswers[answer.playerId] ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>

              {visibleAnswers[answer.playerId] && (
                <div className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md text-base shadow-inner">
                  {answer.answer || <em>Keine Antwort</em>}
                </div>
                )}
              </div>
            ))}
          </>
          )}
        {currentQuestion.mode === "multiple" && (
          <>
          {currentQuestion.answers.map((answer, index) => {
            const matchingPlayers = currentQuestion.playeranswers.filter(
              (a) => a.answer === answer
            );

            return (
              <div key={index} className="bg-gray-700 text-white ring-2 ring-gray-500 rounded-xl p-4">
                <div className="flex justify-between items-center ">
                  <span className="text-lg font-medium">{answer}</span>
                  <div className="flex ">
                    {matchingPlayers.map((player) => (
                      <button
                        key={player.playerId}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAnswer(player.playerId);
                        }}
                        className="flex items-center gap-1 text-sm text-white hover:text-gray-300"
                      >
                        {visibleAnswers[player.playerId] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {matchingPlayers.map(
                  (player) =>
                    visibleAnswers[player.playerId] && (
                      <div
                        key={player.playerId + "-visible"}
                        className="text-sm text-gray-300"
                      >
                        <span className="italic">
                          {player.username || "Keine Antwort"}
                        </span>
                      </div>
                    )
                )}
              </div>
            );
          })}
          </>
        )}
         {currentQuestion.mode === "truefalse" && (
            <>
            {currentQuestion?.playeranswers.map((answer) => (
            <div key={answer.playerId} className="mb-4">
              <button
                onClick={() => toggleAnswer(answer.playerId)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700"
              >
                {answer.username}
                {visibleAnswers[answer.playerId] ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>

              {visibleAnswers[answer.playerId] && (
                <div className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md text-base shadow-inner">
                  {answer.answer || <em>Keine Antwort</em>}
                </div>
                )}
              </div>
            ))}
          </>
          )}
        
            {currentQuestion.mode === "buzzer" && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                {showBuzzeredUser ? (
                  <div className="mb-4">
                    <h2 className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700">
                      {showBuzzeredUser} hat gebuzzert!
                    </h2>
                    <p className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md text-base shadow-inner">
                      War die Antwort korrekt?
                    </p>
                    <div className="flex gap-4 mt-2 justify-center">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                        onClick={() => handleBuzzerAnswer(true)}
                      >
                        Ja
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                        onClick={() => handleBuzzerAnswer(false)}
                      >
                        Nein
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h2 className="w-full flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700">
                      Warte auf den nächsten Spieler...
                    </h2>
                  </div>
                )}
              </div>
            )}
   
        </div>
        <div className="mt-8 text-center">
            <button
              className="px-6 py-3 bg-violet-600 hover:bg-violet-900 transition text-white rounded-md text-lg shadow-md"
              onClick={handleShowAnswer}
            >
              Antwort allen anzeigen
            </button>
          </div>

       

       
      </motion.div>
      ) : (
        <motion.div
          className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-bold mb-6">Spiel beendet 🎉</h2>
            <p className="text-lg text-gray-300 mb-4">Vielen Dank fürs Mitspielen!</p>
            <p className="text-md text-gray-400">Der Admin kann nun ein neues Spiel starten oder das aktuelle auswerten.</p>

            {game?.admin === session?.user?.id && (
              <button
                onClick={onClickRestart}
                className="mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300"
              >
                Neues Spiel starten
              </button>
            )}
        </motion.div>

      )}
      {showrightAnswer && (
        <ShowAnswerToAll 
          answer={currentQuestion.answer}
          players={currentQuestion.playeranswers}
          question={currentQuestion}
          isAdmin={game.admin === session?.user?.id || game.admin._id === session?.user?.id}
          onClick={handleShowNextQuestion}
          game={game}
        />
      )}
    </div>
    

  );
}
