import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import ShowAnswerToAll from "../GameMechanic/showAnswerToAll";
import Scoreboard from "../GameMechanic/Scoreboard";
import { useSession } from "next-auth/react";
import { usePlayerSocket } from "../context/playerContext";
import Image from "next/image";

export default function QuestionView({
  currentQuestionIndex,
  questions,
  game,
  showrightAnswer,
  onClickRestart,
}) {
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const { data: session } = useSession();
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const [showBuzzeredUser, setShowBuzzeredUser] = useState("");
  const { socket } = usePlayerSocket();
  const [pointsGiven, setPointsGiven] = useState(false);

  const currentQuestion = questions?.[currentQuestionIndex];

  useEffect(() => {
    if (
      currentQuestion?.playeranswers?.length > 0 &&
      currentQuestion?.mode === "buzzer"
    ) {
      setHasBuzzed(true);
    } else {
      setHasBuzzed(false);
    }
  }, [currentQuestion, currentQuestionIndex]);

  useEffect(() => {
    if (!socket) return;

    const handleBuzzerPressed = (payload) => {
      setShowBuzzeredUser(payload);
    };

    const handleBuzzerReset = () => {
      setHasBuzzed(false);
      setShowBuzzeredUser("");
    };

    socket.on("buzzerPressed", handleBuzzerPressed);
    socket.on("buzzerResetNow", handleBuzzerReset);

    return () => {
      socket.off("buzzerPressed", handleBuzzerPressed);
      socket.off("buzzerResetNow", handleBuzzerReset);
    };
  }, [socket]);

  function toggleAnswer(playerId) {
    setVisibleAnswers((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  }

  function handleShowAnswer() {
    socket.emit("showRightAnswer", { gameId: game._id, showAnswer: true });
  }

  function handleShowNextQuestion() {
    socket.emit("nextQuestion", {
      gameId: game._id,
      questionIndex: currentQuestionIndex + 1,
    });
    setVisibleAnswers({});
    socket.emit("showRightAnswer", { gameId: game._id, showAnswer: false });
  }

  function handleBuzzerAnswer(isCorrect, playerId) {
    // Prevent duplicate point submissions on rapid double clicks
    if (pointsGiven) return;

    if (isCorrect === true) {
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

    if (isCorrect === false) {
      socket.emit("removePoints", {
        gameId: game._id,
        playerId,
        points: currentQuestion.points,
      });
      socket.emit("buzzerReset", { gameId: game._id });
      setPointsGiven(true);
      setTimeout(() => {
        setPointsGiven(false);
      }, 2000);
      setShowBuzzeredUser("");
      setHasBuzzed(false);
    }
  }

  if (!currentQuestion && !game?.finished) {
    return <p className="text-center text-red-500">Keine Fragen vorhanden!</p>;
  }

  const adminId = String(game?.admin?._id || game?.admin || "");
  const isGameAdmin = Boolean(
    session?.user?.id && String(session.user.id) === adminId
  );
  const buzzerUsername =
    showBuzzeredUser?.username ||
    currentQuestion?.playeranswers?.[0]?.username ||
    "Spieler";

  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-gray-950 overflow-auto">
      <AnimatePresence mode="wait">
        {!game?.finished ? (
          <motion.div
            className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-10 rounded-3xl border border-gray-700 shadow-2xl"
            key={currentQuestionIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
              <span className="text-base flex items-center mb-6">
                Frage {currentQuestionIndex + 1}{" "}
                <span className="text-violet-400 ml-1">
                  / Modus {currentQuestion.mode}
                </span>
              </span>
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.mode === "picture" && (
                <>
                  {currentQuestion?.file && (
                    <div className="col-span-2 flex justify-center">
                      <Image
                        src={currentQuestion.file}
                        alt="Frage"
                        width={500}
                        height={500}
                        className="rounded-lg shadow-lg w-1/2 col-span-2"
                      />
                    </div>
                  )}
                  {currentQuestion?.playeranswers?.map((answer) => (
                    <div key={answer.playerId} className="mb-4">
                      <button
                        onClick={() => toggleAnswer(answer.playerId)}
                        className="w-full cursor-pointer flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700"
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

              {(currentQuestion.mode === "open" ||
                currentQuestion.mode === "truefalse") && (
                <>
                  {currentQuestion?.playeranswers?.map((answer) => (
                    <div key={answer.playerId} className="mb-4">
                      <button
                        onClick={() => toggleAnswer(answer.playerId)}
                        className="w-full cursor-pointer flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300 hover:bg-blue-700"
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
                          {currentQuestion.mode === "truefalse"
                            ? String(answer.answer) === "true"
                              ? "Wahr"
                              : "Falsch"
                            : answer.answer || <em>Keine Antwort</em>}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {currentQuestion.mode === "multiple" && (
                <>
                  {currentQuestion.answers?.map((answer, index) => {
                    const matchingPlayers =
                      currentQuestion.playeranswers?.filter(
                        (a) => a.answer === answer
                      ) || [];

                    return (
                      <div
                        key={index}
                        className="bg-gray-700 text-white ring-2 ring-gray-500 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium">{answer}</span>
                          <div className="flex gap-1">
                            {matchingPlayers.map((player) => (
                              <button
                                key={player.playerId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAnswer(player.playerId);
                                }}
                                className="flex items-center gap-1 text-sm text-white hover:text-gray-300 cursor-pointer"
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
                                key={`${player.playerId}-visible`}
                                className="text-sm text-gray-300 mt-1"
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

              {currentQuestion.mode === "buzzer" && (
                <div className="flex flex-col items-center justify-center h-full text-center col-span-2">
                  {hasBuzzed && currentQuestion?.playeranswers?.[0] ? (
                    <div className="mb-4 w-full max-w-md">
                      <h2 className="w-full flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300">
                        {buzzerUsername} hat gebuzzert!
                      </h2>
                      <p className="mt-2 px-4 py-2 bg-gray-800 text-white rounded-md text-base shadow-inner">
                        War die Antwort korrekt?
                      </p>
                      <div className="flex gap-4 mt-3 justify-center">
                        <button
                          className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                          onClick={() =>
                            handleBuzzerAnswer(
                              true,
                              currentQuestion.playeranswers[0].playerId
                            )
                          }
                        >
                          Ja
                        </button>
                        <button
                          className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200"
                          onClick={() =>
                            handleBuzzerAnswer(
                              false,
                              currentQuestion.playeranswers[0].playerId
                            )
                          }
                        >
                          Nein
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <h2 className="w-full flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 text-lg font-medium bg-blue-600 text-white ring-2 ring-blue-300">
                        Warte auf den nächsten Spieler...
                      </h2>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <button
                className="px-6 py-3 cursor-pointer bg-violet-600 hover:bg-violet-900 transition text-white rounded-md text-lg shadow-md"
                onClick={handleShowAnswer}
              >
                Antwort allen anzeigen
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="relative w-full flex flex-col justify-center max-w-4xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-12 rounded-3xl border border-gray-700 shadow-2xl text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-6">Spiel beendet 🎉</h2>
            <p className="text-lg text-gray-300 mb-6">Vielen Dank fürs Mitspielen!</p>
            <p className="text-base text-gray-400 mb-8">
              Der Admin kann nun ein neues Spiel starten oder das aktuelle auswerten.
            </p>

            {isGameAdmin && (
              <button
                onClick={onClickRestart}
                className="px-6 py-3 cursor-pointer bg-violet-600 hover:bg-violet-800 text-white rounded-lg shadow-lg transition duration-300 mt-2 mx-auto"
              >
                Neues Spiel starten
              </button>
            )}

            <Scoreboard scores={game?.scores} />
          </motion.div>
        )}

        {showrightAnswer && currentQuestion && (
          <ShowAnswerToAll
            answer={currentQuestion.answer}
            players={currentQuestion.playeranswers}
            question={currentQuestion}
            isAdmin={isGameAdmin}
            onClick={handleShowNextQuestion}
            game={game}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
