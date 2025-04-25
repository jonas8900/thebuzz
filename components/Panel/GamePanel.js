import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion } from "framer-motion";
import { usePlayerSocket } from "../context/playerContext";
import Loading from "../Status/Loading";
import AdminView from "../Mechanic/Adminview";
import GuestView from "../Mechanic/Guestview";


export default function GamePanel() {
  const router = useRouter();
  const { isReady, query } = router;
  const { x: queryId } = query;
  const { data: session } = useSession();
  const { players, socket } = usePlayerSocket();
  const { data: gameByID, isLoading } = useSWR(
    isReady && queryId ? `/api/gamemechanic/getGameById?x=${queryId}` : null,
  );
  const [lockedPlayers, setLockedPlayers] = useState({});
  const [game, setGame] = useState(null);
  const [showBuzzeredUser, setShowBuzzeredUser] = useState("");
  const [showBuzzerAnimation, setShowBuzzerAnimation] = useState(false);
  const [showrightAnswer, setShowRightAnswer] = useState(false);


  
  //Gelockte Spieler im Localstorage für die Anordnung der Kameras und der namen 
  useEffect(() => {
    if (Object.keys(lockedPlayers).length > 0) {
      localStorage.setItem("lockedPlayers", JSON.stringify(lockedPlayers));
    }
  }, [lockedPlayers]);


  //Spieler aus dem Localstorage holen die schonmal geloggt worden sind
  useEffect(() => {
    const savedLockedPlayers = localStorage.getItem("lockedPlayers");
    if (savedLockedPlayers) {
      setLockedPlayers(JSON.parse(savedLockedPlayers));
    }
  }, []);

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
  
//Buzzer gedrückt
  useEffect(() => {
    socket.on("buzzerPressed", (username) => {
      console.log("Buzzer gedrückt von:", username);
      const audio = new Audio(`/sounds/sound${Math.floor(Math.random() * 6) + 1}.mp3`);

      audio.play().catch((error) => {
        const userPrompt = window.confirm("Möchtest du die automatische Wiedergabe für diese Seite zulassen?");
        if (userPrompt) {
          audio.play(); 
        }
      });

      setShowBuzzeredUser(username);
      setShowBuzzerAnimation(true);
      setTimeout(() => {
        setShowBuzzerAnimation(false);
      }, 3000); 
    });

    return () => {
      socket.off("buzzerPressed");
    };
  }, [socket]);


  //Buzzer zurücksetzen
  useEffect(() => {
    socket.on("resetBuzzer", () => {
      console.log("Buzzer zurückgesetzt");
      setShowBuzzeredUser("");
      setShowBuzzerAnimation(false);
    });
    }, [socket]) 


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


  //refresh game
  useEffect(() => {
    if (!socket) return;
    const gameId = gameByID?._id;
  
    function handleGameUpdate ({ game: updatedGame }) {
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

// Wenn ein Spieler joint erscheint ein neuer Spieler als Grabelement mit Locksymbol, hier kann man ihn an die Position ziehen und dann mit dem Lock Symbol fixieren
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

  
//startet das Spiel
  function handleStartGame() {
    if (!game) return;
    socket.emit("startGame", { gameId: game._id });
  }


  return (
    <>
     <div className="absolute top-1/2 left-1/2 lg:w-3/4 lg:h-3/4 w-full h-full flex flex-col justify-center items-center border bg-gray-900 rounded-2xl shadow-2xl transform -translate-x-1/2 -translate-y-1/2 overflow-hidden text-white">

      {showBuzzerAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-2xl text-2xl font-bold shadow-2xl z-99999"
        >
          🚨 {showBuzzeredUser.username} hat gebuzzert!
        </motion.div>
      )}

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
              gameByID={game}
              session={session}
              handleStartGame={handleStartGame} 
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
        {player.username} {player.points}
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
