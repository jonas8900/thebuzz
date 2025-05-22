
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePlayerSocket } from "../context/playerContext";
import ShowAnswerToAll from "../GameMechanic/showAnswerToAll";
import BigRedBuzzer from "../Buttons/RedBuzzer";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaCrown } from "react-icons/fa";



export default function GuestView({ players, session, showrightAnswer }) {
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerInput, setAnswerInput] = useState("");
    const [hasBuzzed, setHasBuzzed] = useState(false);
    const { socket } = usePlayerSocket();
    const [gameByID, setGameByID] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
      if (!socket) return;
    
      socket.on("gameUpdated", ({ game }) => {
        setGameByID(game);
      });
    
      return () => {
        socket.off("gameUpdated");
      };
    }, [socket]);
    

    const currentQuestion = gameByID?.questions[gameByID?.currentQuestionIndex];
    const currentQuestionIndex = gameByID?.currentQuestionIndex;
    const [isQuestionReady, setIsQuestionReady] = useState(false);
    const router = useRouter();
    const [selectedScoreIndex, setSelectedScoreIndex] = useState(0);

    useEffect(() => {
      setIsQuestionReady(false); 
      const timer = setTimeout(() => {
        setIsQuestionReady(true); 
      }, 200); 
    
      return () => clearTimeout(timer); 
    }, [showrightAnswer]);
    

    useEffect(() => {
      setHasBuzzed(false);
      if(currentQuestion?.mode === "buzzer") {
        if(currentQuestion?.playeranswers.length > 0) {
            setHasBuzzed(true);
          }
      } else {
        setHasBuzzed(false);
      }
    }, [currentQuestion, session?.user?.id, socket]);

    useEffect(() => {
      socket.on("banned", ({ message }) => {
        console.log(message);
        router.push("/banned");
      });
     
    
      return () => {
        window.location.reload();
        socket.off("banned");
      };
    }, [ socket, router ]);

    useEffect(() => {
      if (gameByID?.scores?.length > 0) {
        setSelectedScoreIndex(gameByID.scores.length - 1); 
      }
    }, [gameByID?.scores]);

    function handleAnswer(event) {
        if(currentQuestion.mode === "open" || currentQuestion.mode === "picture") {
          event.preventDefault();

          if (!answerInput) return;

          const answer = {
              playerId: session?.user.id,
              username: session?.user.username,
              answer: answerInput,
          };
          socket.emit("submitAnswer", { gameId: gameByID._id, playerId: session?.user.id, username: session?.user.username, answer });
          setAnswerInput("");
        }

      if (currentQuestion.mode === "multiple" || currentQuestion.mode === "truefalse") {
        const answer = {
g
        };
        socket.emit("submitAnswer", { gameId: gameByID._id, playerId: session?.user.id, username: session?.user.username, answer });
        setSelectedAnswer(null);
      }
     
    }

    function handleScoreChange(event) {
      setSelectedScoreIndex(Number(event.target.value));
    }



    function handleBuzzer() {

      if (hasBuzzed) return;

      const answer = {
        playerId: session?.user.id,
        username: session?.user.username,
        answer: true,
      };
      socket.emit("submitAnswer", { gameId: gameByID._id, playerId: session?.user.id, username: session?.user.username, answer });
      socket.emit("buzzer", { gameId: gameByID._id, username: session?.user.username });
      if(currentQuestion.mode === "buzzer") {
        setHasBuzzed(true);
        setSelectedAnswer(null);
      }
    }
console.log(players)

    return (
      <>
      {!gameByID?.finished ? (
      <>
        {gameByID?.started ? (
          <>
          
            <AnimatePresence mode="wait">

            <div className='w-full h-full flex items-center justify-center p-6 bg-gray-950'>
            {isQuestionReady && (
              <>
               <div className="absolute left-10 top-10 w-1/4 bg-gray-800 p-4 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Aktuelle Punkte</h2>
              {players.length > 0 && (
                <ul>
                  {players.map((player) => (
                    <>
                      {player.hasOwnProperty('points') && (
                        <li key={player.username} className="text-lg text-gray-300">
                          {player.username}: {player.points} P
                          {currentQuestion?.playeranswers.find(
                            (answer) => answer.playerId === player.playerId
                          ) && (
                            <span className="text-green-400 ml-2">✔️</span>
                          )}
                        </li>
                      )}
                    </>
                  ))}
                </ul>
              )}
            </div>
              
              <motion.div
                className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl"
                key={currentQuestionIndex} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0}}
                transition={{ duration: 1, delay: 0.5 }}
              >
                
                  
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-sm md:text-base tracking-wide text-gray-300">
                      Frage {currentQuestionIndex + 1}
                      <span className="ml-2 text-violet-400 font-semibold">
                        / Modus {currentQuestion.mode}
                      </span>
                    </h2>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold mb-10 text-center leading-snug drop-shadow">
                    {currentQuestion.question}
                  </h3>

                  {currentQuestion.mode === "picture" && (
                    <div className="flex justify-center mb-6">
                      <Image src={currentQuestion.file} alt="Frage Bild" width={500} height={500} className="rounded-lg shadow-lg w-1/2 col-span-2" />
                    </div>
                  )}

                  {(currentQuestion.mode === "open" || currentQuestion.mode === "picture") && (
                    <div className="flex flex-col items-center space-y-6">
                      {currentQuestion.playeranswers.find(
                        (answer) => answer.playerId === session?.user.id
                      ) ? (
                         showAnswer ? (
                          <>
                            <h4 className="text-xl text-center font-semibold text-green-400">
                              Deine Antwort: {" "}
                              {
                                currentQuestion.playeranswers.find(
                                  (answer) => answer.playerId === session?.user.id
                                ).answer
                              }
                            </h4>
                            <button 
                              onClick={() => setShowAnswer(false)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md"
                            >
                              Deine antwort verbergen
                            </button>
                          </>
                          ) : (
                            <button
                              onClick={() => setShowAnswer(true)}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition shadow-md"
                            >
                              Deine antwort anzeigen
                            </button>
                          )

                      ) : (
                        <form
                          onSubmit={handleAnswer}
                          className="flex flex-col w-full max-w-md space-y-5"
                        >
                          <div className="relative w-full">
                            <input
                              type="password"
                              id="answer"
                              name="answer"
                              required
                              placeholder=" "
                              value={answerInput}
                              onChange={(e) => setAnswerInput(e.target.value)}
                              className="peer w-full px-4 pt-5 pb-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                            <label
                              htmlFor="answer"
                              className={`absolute left-4 text-sm text-gray-500 dark:text-gray-400 transition-all pointer-events-none
                                ${answerInput ? 'top-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                peer-placeholder-shown:top-1/2 
                                peer-placeholder-shown:-translate-y-1/2 
                                peer-focus:top-2 
                                peer-focus:text-xs 
                                peer-focus:text-blue-500`}
                            >
                              Deine Antwort
                            </label>
                          </div>
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition w-full shadow-md"
                          >
                            Antwort abschicken
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                  {currentQuestion.mode === "multiple" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.answers.map((answer, index) => {
                        const foundAnswer = currentQuestion.playeranswers.find(
                          (answer) => answer.playerId === session?.user.id
                        );
                        const playerGivenAnswer = foundAnswer?.answer;
                        
                        return(
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedAnswer(answer);
                            handleAnswer(answer);
                          }}
                          disabled={foundAnswer}
                          className={`w-full cursor-pointer max-w-md bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition ${
                            selectedAnswer === answer ? "bg-blue-600" : ""
                          }
                          ${foundAnswer ? "opacity-100 hover:cursor-not-allowed bg-gray-700" : ""}
                            ${playerGivenAnswer === answer ? "bg-green-600 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-700"}
                          `}
                        >
                          {answer}
                        </button>
                        );})}
                    </div>
                  )}
                  {currentQuestion.mode === "truefalse" && (
                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                        {["Wahr", "Falsch"].map((label, index) => {
                          const boolValue = label === "Wahr";
                          const foundAnswer = currentQuestion.playeranswers.find(
                            (answer) => answer.playerId === session?.user.id
                          );
                          const playerGivenAnswer = foundAnswer?.answer;
                          console.log(playerGivenAnswer,'playerGivenAnswer')
                          console.log(boolValue,'boolValue')
                          console.log(foundAnswer,'foundAnswer')

                          return (
                            <button
                              key={index}
                              onClick={() => handleAnswer(boolValue)}
                              disabled={!!foundAnswer}
                              className={`w-full cursor-pointer bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 
                                ${foundAnswer ? "opacity-100 hover:cursor-not-allowed bg-gray-700" : ""}
                                ${String(playerGivenAnswer) === String(boolValue) ? "bg-green-600 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-700"}
                              `}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {currentQuestion.mode === "buzzer" && (
                    
                        <div className="flex flex-col items-center space-y-6">
                          <BigRedBuzzer onClick={handleBuzzer} disabled={hasBuzzed} className={`absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2  ${hasBuzzed ? "opacity-50 cursor-not-allowed bg-green-800 dark:bg-green-800" : ""}`}>
                            BUZZERN!
                          </BigRedBuzzer>
                        </div>

                    )}
                 
                
                </motion.div>
                </>
              )}
            </div>
            </AnimatePresence>
        


          </>
        ) : (
          <>
            <div className="absolute left-10 top-10 w-1/4 bg-gray-800 p-4 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Wartende Spieler</h2>
              {players.length > 0 ? (
                <ul>
                  {players.map((player) => (
                    <li key={player.username} className="text-lg text-gray-300">
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
                className="text-center"
              >
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
  
              <p className="text-sm text-gray-400 mt-4">
                Der Admin bereitet das Spiel vor...
              </p>
              
            </div>
            
          </>
        )}

        {showrightAnswer && (
          <ShowAnswerToAll 
            answer={currentQuestion.answer}
            players={currentQuestion.playeranswers}
            question={currentQuestion}
            isAdmin={gameByID.admin === session?.user?.id}
            game={gameByID}
          />

        )}
      </>
    ) : (
      <>
        <motion.div
          className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-bold mb-6">Spiel beendet 🎉</h2>
            <p className="text-lg text-gray-300 mb-4">Vielen Dank fürs Mitspielen!</p>
            <p className="text-md text-gray-400">Der Admin kann nun ein neues Spiel starten oder das aktuelle auswerten.</p>

        </motion.div>



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
              {gameByID && gameByID.scores?.map((score, index) => (
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
          {gameByID && gameByID?.scores?.length > 0 ? (
            gameByID?.scores[selectedScoreIndex]?.results?.length > 0 ? (
              gameByID?.scores[selectedScoreIndex]?.results
                .sort((a, b) => b.points - a.points)
                .map((score, index) => {
                  
                  const isFirstPlace = index === 0;



                  return (
                    <motion.div
                      key={score.player._id}
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
                          {score.player.username}
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


      </>


    )}
      </>
    );
  }
  
