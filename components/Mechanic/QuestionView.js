import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import ShowAnswerToAll from "../GameMechanic/showAnswerToAll";
import { useSession } from "next-auth/react";
import { usePlayerSocket } from "../context/playerContext";
import { FaCrown } from "react-icons/fa";

export default function QuestionView({ currentQuestionIndex, questions, game, showrightAnswer, onClickRestart}) {
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const { data: session } = useSession();
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [showBuzzeredUser, setShowBuzzeredUser] = useState("");
  const { socket } = usePlayerSocket();
  const [pointsGiven , setPointsGiven ] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);
  const [selectedScoreIndex, setSelectedScoreIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if(currentQuestion?.playeranswers?.length > 0 && currentQuestion?.mode === "buzzer") {
      setHasBuzzed(true);

    } else {
      setHasBuzzed(false);
    }
  }, [socket, currentQuestion, currentQuestionIndex]);


  useEffect(() => {
    socket.on("buzzerPressed", (username) => {
      setShowBuzzeredUser(username);
    });

    return () => {
      socket.off("buzzerPressed");
    }
  }, [socket]);

  useEffect(() => {
    if (game?.scores?.length > 0) {
      setSelectedScoreIndex(game.scores.length - 1); 
    }
  }, [game?.scores]);


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
 
    socket.emit("nextQuestion", { gameId: game._id, questionIndex: currentQuestionIndex + 1 });
    setVisibleAnswers({});

    socket.emit("showRightAnswer", { gameId: game._id, showAnswer: false });


  }

  function handleScoreChange(event) {
    setSelectedScoreIndex(Number(event.target.value));
}


  function handleBuzzerAnswer(bool, playerId) {

//statemanagement "pointsGiven" verhindert mehrmaliges draufklicken und versuchen die punkte zu bekommen
      if (bool === true) {
        if(pointsGiven) {
          console.log("Punkte wurden bereits vergeben");
          return;
        }
        socket.emit("setPointsToUser", {
          gameId: game._id,
          playerId,
          points: currentQuestion.points,
        });
        setPointsGiven(true);
        setTimeout(() => {
          setPointsGiven(false);
        }, 2000);
        socket.emit("showRightAnswer", { gameId: game._id, showAnswer: true });
      }

      if(bool === false) {
        if(pointsGiven) {
          console.log("Punkte wurden bereits abgezogen");
          return; 
        }
        socket.emit("removePoints", { 
          gameId: game._id, 
          playerId, 
          points: currentQuestion.points 
        });
        socket.emit("buzzerReset", { gameId: game._id});
        setPointsGiven(true);
        setTimeout(() => {
          setPointsGiven(false);
        }, 2000);
        setShowBuzzeredUser("");
        setHasBuzzed(false);
      }
  }

  
  if (!currentQuestion) {
    return <p className="text-center text-red-500">Keine Fragen vorhanden!</p>;
  }



  return (

    <div className="w-full h-full flex items-center justify-center p-6 bg-gray-950">
      <AnimatePresence mode="wait">
      {!game?.finished ? (
      <motion.div
        className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl"
        key={currentQuestionIndex} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0}}
        transition={{ duration: 1, delay: 0.5 }}
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
                {hasBuzzed ?  (
                  <div className="mb-4">
                    <h2 className="w-full flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700">
                      {showBuzzeredUser.username} hat gebuzzert!
                    </h2>
                    <p className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md text-base shadow-inner">
                      War die Antwort korrekt?
                    </p>
                    <div className="flex gap-4 mt-2 justify-center">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                        onClick={() => handleBuzzerAnswer(true, currentQuestion.playeranswers[0].playerId)}
                      >
                        Ja
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                        onClick={() => handleBuzzerAnswer(false, currentQuestion.playeranswers[0].playerId)}
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
         <>
        <motion.div
          className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 rounded-3xl border border-gray-700 shadow-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-6">Spiel beendet 🎉</h2>
          <p className="text-lg text-gray-300 mb-6">Vielen Dank fürs Mitspielen!</p>
          <p className="text-md text-gray-400 mb-8">Der Admin kann nun ein neues Spiel starten oder das aktuelle auswerten.</p>

          {(game.admin === session?.user?.id || game.admin._id === session?.user?.id) && (
            <button
              onClick={onClickRestart}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300 mt-6"
            >
              Neues Spiel starten
            </button>
          )}
        
            


        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mt-14 px-4"
        >
          <p className="text-lg mb-8">Hier sind die Spielergebnisse und Punktestände</p>

          <div className="text-center mb-6">
            <select
              value={selectedScoreIndex}
              onChange={handleScoreChange}
              className="bg-gray-700 text-white p-2 rounded-lg mb-6"
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
  game?.scores[selectedScoreIndex]?.results?.length > 0 ? (
    game?.scores[selectedScoreIndex]?.results
      .sort((a, b) => b.points - a.points)
      .map((score, index) => {
        const player = game?.players.find(p => {
          return score.player._id === p?.playerId?._id.toString() ;
        });
        const isFirstPlace = index === 0;

        if (!player) {
          return (
            <motion.div key={score.player._id} className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-center">
                <p>Player not found</p>
              </div>
            </motion.div>
          );
        }

        return (
          <motion.div
            key={score.player}
            className={`bg-gray-800 p-6 rounded-lg shadow-lg ${isFirstPlace ? 'scale-110' : ''}`}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="text-center relative">
              {isFirstPlace && (
                <motion.div
                  initial={{ y: 10 }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-[-20px] left-1/2 transform -translate-x-1/2"
                >
                  <FaCrown className="text-yellow-400 text-3xl" />
                </motion.div>
              )}
              <h2 className={`text-xl font-semibold ${isFirstPlace ? 'text-yellow-500 text-3xl' : ''}`}>
                {player.username}
              </h2>
              <p className="text-lg">Punkte: {score.points}</p>
            </div>
          </motion.div>
        );
      })
  ) : (
    <p>No scores available</p>
  )
) : (
  <p>Loading...</p>
)}

          </div>
          
          </motion.div>
        </motion.div>
        </>
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
      </AnimatePresence>

    </div>

    
    

  );
}
