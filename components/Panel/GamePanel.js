import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import Image from "next/image";
import io from "socket.io-client";
import { usePlayerSocket } from "../context/playerContext";
import Loading from "../Status/Loading";
import QuestionView from "../Mechanic/QuestionView";
import AdminView from "../Mechanic/Adminview";
import GuestView from "../Mechanic/Guestview";


export default function GamePanel() {
  const router = useRouter();
  const { isReady, query } = router;
  const { x: queryId } = query;
  const { data: session, status } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { players, socket } = usePlayerSocket();
  const { data: gameByID, isLoading } = useSWR(
    isReady && queryId ? `/api/gamemechanic/getGameById?x=${queryId}` : null,
  );
  const [lockedPlayers, setLockedPlayers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [game, setGame] = useState(null);
  const [showrightAnswer, setShowRightAnswer] = useState(false);

  useEffect(() => {
    const savedLockedPlayers = localStorage.getItem("lockedPlayers");
    if (savedLockedPlayers) {
      setLockedPlayers(JSON.parse(savedLockedPlayers));
    }
  }, []);
  
  useEffect(() => {
    if (Object.keys(lockedPlayers).length > 0) {
      localStorage.setItem("lockedPlayers", JSON.stringify(lockedPlayers));
    }
  }, [lockedPlayers]);

  //showrightanswer
  useEffect(() => {
    socket.on("showRightAnswerNow", (showAnswer) => {
      console.log("Empfangenes showAnswer:", showAnswer);  
      setShowRightAnswer(showAnswer); 
    });
  
    return () => {
      socket.off("showRightAnswerNow");
    };
  }, [socket]);
  


//Joingame
  useEffect(() => {
    if (!gameByID || !session?.user) return;
  
    const playerId = session.user.id;
    const username = session.user.username;
  
    const alreadyJoined = gameByID.players.some((p) => p.id === playerId);
  
    if (!alreadyJoined) {
      socket.emit("joinGame", { gameId: queryId, playerId, username });
    }
  }, [gameByID, session]);
  
//Startgame
  useEffect(() => {
    socket.on("gameStarted", ({ gameId }) => {
      console.log("Spiel gestartet für:", gameId);
    });
  
    return () => {
      socket.off("gameStarted");
    };
  }, [socket]);

  useEffect(() => {
    if (gameByID?.questions) {
      setQuestions(gameByID.questions);
    }
  }, [gameByID, game]);


  //refresh game
  useEffect(() => {
    if (!socket) return;
    const gameId = gameByID?._id;
  
    function handleGameUpdate ({ game: updatedGame }) {
      console.log("Updated Game:", updatedGame);
      setGame(updatedGame);
    };
  
    socket.on("gameUpdated", handleGameUpdate);
    socket.emit("getUpdatedGame", { gameId });
  
    return () => {
      socket.off("gameUpdated", handleGameUpdate);
    };
  }, [socket, gameByID]);

  if(!game) {
    setGame(gameByID);
  }


  if (!isReady || isLoading || !gameByID) return <Loading />;


  function toggleLock(playerKey) {
    setLockedPlayers((prev) => {
      const prevPlayer = prev[playerKey] || { locked: false, x: 0, y: 0 };
      const updated = {
        ...prev,
        [playerKey]: {
          ...prevPlayer,
          locked: !prevPlayer.locked,
        },
      };
      localStorage.setItem("lockedPlayers", JSON.stringify(updated));
      return updated;
    });
  }

  

  function handleStartGame() {
    if (!game) return;
    socket.emit("startGame", { gameId: game._id });
  }

  function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  return (
    <>
     <div className="absolute top-1/2 left-1/2 lg:w-3/4 lg:h-3/4 w-full h-full flex flex-col justify-center items-center border bg-gray-900 rounded-2xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 overflow-hidden text-white">
      <>
            {session.user.isGuest && (
            
            <GuestView 
              gameByID={game}
              players={players}
              socket={socket}
              session={session}
              showrightAnswer={showrightAnswer}
            />
            )}
          </>

        <>
        {!session.user.isGuest && (

          <AdminView 
            players={players} 
            lockedPlayers={lockedPlayers}
            setLockedPlayers={setLockedPlayers}
            toggleLock={toggleLock}
            gameByID={game}
            session={session}
            handleStartGame={handleStartGame} 
            handleNextQuestion={handleNextQuestion}
            showrightAnswer={showrightAnswer}
            setShowRightAnswer={setShowRightAnswer}
            />
        )}
        
      </>
      </div>  
      {!session.user.isGuest && (
        <>
      {players.map((player) => {
              const playerKey = player.username;
              return(
      <motion.div
        drag={!lockedPlayers[playerKey]?.locked}
        key={playerKey}
        animate={{
          x: lockedPlayers[playerKey]?.x || 0,
          y: lockedPlayers[playerKey]?.y || 0,
        }}
        onDragEnd={(event, info) => {
          setLockedPlayers((prev) => {
            const prevPlayer = prev[playerKey] || { x: 0, y: 0, locked: false };
          
            const newX = (prevPlayer.x || 0) + info.offset.x;
            const newY = (prevPlayer.y || 0) + info.offset.y;
          
            const updated = {
              ...prev,
              [playerKey]: {
                ...prevPlayer,
                x: newX,
                y: newY,
              },
            };
          
            localStorage.setItem("lockedPlayers", JSON.stringify(updated));
            return updated;
          });
        }}
        className={`absolute z-100 text-lg text-gray-200 ${
          lockedPlayers[playerKey]?.locked ? "bg-violet-700" : "bg-gray-600"
        } p-2 rounded-md cursor-move mb-2`}
      >
        {player.username}
        <button
          onClick={() => toggleLock(playerKey)}
          className="ml-2 px-2 py-1 bg-white text-black rounded"
        >
          {lockedPlayers[playerKey]?.locked ? "Unlock" : "Lock"}
        </button>
      </motion.div>
      )}
      )}
      </>
    )}
    </>
    
  );
}
