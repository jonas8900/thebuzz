import QuestionView from "./QuestionView";
import { usePlayerSocket } from "../context/playerContext";

export default function AdminView({
  players,
  gameByID,
  handleStartGame,
  session,
  showrightAnswer,
  setShowRightAnswer,
}) {
  const { socket } = usePlayerSocket();

  function handleRestartGame() {
    setShowRightAnswer(false);
    socket.emit("restartGame", { gameId: gameByID._id });
  }

  return (
    <>
      {!gameByID?.started && !gameByID?.finished && (
        <>
          <div className="absolute left-10 top-10 w-1/4 bg-gray-800 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Wartende Spieler</h2>
            {players.length > 0 ? (
              <ul>
                {players.map((player) => (
                  <li
                    key={player.playerId || player.username}
                    className="text-lg text-gray-300"
                  >
                    {player.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Leer hier...</p>
            )}
          </div>
          <div className="flex flex-col items-center w-1/2 text-center">
            <h3 className="text-xl font-bold mb-4">Hey {session.user.username}!</h3>
            <p className="mb-3">
              Du bist der Admin dieses Spiels. Auf dieser Seite moderierst du die
              laufende Runde.
            </p>
            <p className="mb-3">
              Aktive Spieler siehst du jederzeit oben links. Sollte jemand das Spiel
              verlassen oder neu dazukommen, aktualisiert sich die Liste automatisch.
            </p>
            <p>
              Die erreichten Punkte der Spieler werden direkt an ihren Namenskarten
              angezeigt.
            </p>

            <button
              onClick={handleStartGame}
              className="items-center m-auto px-5 py-2.5 cursor-pointer bg-green-600 rounded-md mt-6 hover:bg-green-700 transition font-semibold"
            >
              Spiel starten
            </button>
          </div>
        </>
      )}

      {(gameByID?.started || gameByID?.finished) && (
        <QuestionView
          questions={gameByID?.questions}
          currentQuestionIndex={gameByID?.currentQuestionIndex}
          game={gameByID}
          showrightAnswer={showrightAnswer}
          onClickRestart={handleRestartGame}
        />
      )}
    </>
  );
}
