
import { motion } from "framer-motion";
import QuestionView from "./QuestionView";
import { usePlayerSocket } from "../context/playerContext";
import { useEffect, useState } from "react";


export default function AdminView({   
    players,
    lockedPlayers,
    setLockedPlayers,
    toggleLock,
    gameByID,
    handleStartGame,
    session,
    handleNextQuestion,
    showrightAnswer,
    setShowRightAnswer,
}) {
    const { socket } = usePlayerSocket();
    const [game, setGame] = useState(null);

    if(!game) {
      setGame(gameByID);
    }
  


    return(
            <>
                <>
                {!game?.started && (
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
                    <p className="text-gray-500">Leer hier...</p>
                  )}
                </div>
                <div className="flex flex-col items-center w-1/2">
                  <h3 className="text-xl font-bold mb-4">Hey {session.user.username} !</h3>
                  <p>Du bist der Admin dieses Spieles, auf dieser Seite findet das Spiel statt</p><br></br>
                  <p>Aktive Spieler siehst du jederzeit oben links, sollte jemand das Spiel verlassen oder neu dazukommen, siehst du das</p><br></br>
                  <p>Die Punkte, die die jeweiligen Spieler erreicht haben, siehst du über den jeweiligen Spielern</p>

                  <button onClick={handleStartGame} className="items-center m-auto px-4 py-2 bg-green-600 rounded-md mt-6 hover:bg-green-700 transition">
                    spiel starten
                  </button>
                </div>
                </> 
                  )}

                  {game?.started && (
                    <>
                      <QuestionView 
                        gameId={gameByID?._id} 
                        questions={game?.questions} 
                        currentQuestionIndex={gameByID?.currentQuestionIndex} 
                        game={game} 
                        showrightAnswer={showrightAnswer} 
                        setShowRightAnswer={setShowRightAnswer}
                        
                        />
                    </>
                  )}
                  
                  {game?.started && game?.questions.length > 0 && (

                    <div className="flex flex-col absolute bottom-10 w-1/2">

                      <button
                        onClick={handleNextQuestion}
                        className="items-center m-auto px-4 py-2 bg-blue-600 rounded-md mt-6 hover:bg-blue-700 transition"
                      >
                        Nächste Frage
                      </button>
                    </div>
                  )}
                </>
              
          
        </>
    );
}