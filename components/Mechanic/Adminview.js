
import { motion } from "framer-motion";
import QuestionView from "./QuestionView";
import { useEffect, useState } from "react";
import { usePlayerSocket } from "../context/playerContext";


export default function AdminView({   
    players,
    gameByID,
    handleStartGame,
    session,
    showrightAnswer,
    setShowRightAnswer,
    showBuzzeredUser
}) {
    const { socket } = usePlayerSocket();


    function handleRestartGame() {
        setShowRightAnswer(false);

        socket.emit("restartGame", { gameId: gameByID._id });
    }

    return(
            <>
                <>
                {!gameByID?.started && !gameByID.finished && (
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

                  {(gameByID?.started || gameByID?.finished) && (
                    <>

                  
                      <QuestionView 
                        gameId={gameByID?._id} 
                        questions={gameByID?.questions} 
                        currentQuestionIndex={gameByID?.currentQuestionIndex} 
                        game={gameByID} 
                        showrightAnswer={showrightAnswer} 
                        onClickRestart={handleRestartGame}
                        
                        />

                    </>
                  )}
                  

                </>
              
          
        </>
    );
}