import { useSession, signOut } from "next-auth/react";
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
    isReady && queryId
      ? `/api/gamemechanic/getGameByIdWithoutQuestions?x=${queryId}`
      : null
  );
  const [lockedPlayers, setLockedPlayers] = useState({});
  const [game, setGame] = useState(null);
  const [showBuzzeredUser, setShowBuzzeredUser] = useState("");
  const [showBuzzerAnimation, setShowBuzzerAnimation] = useState(false);
  const [showrightAnswer, setShowRightAnswer] = useState(false);

  // Restore draggable player card positions from localStorage
  useEffect(() => {
    const savedLockedPlayers = localStorage.getItem("lockedPlayers");
    if (savedLockedPlayers) {
      try {
        setLockedPlayers(JSON.parse(savedLockedPlayers));
      } catch {
        // Ignore corrupted localStorage entry
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(lockedPlayers).length > 0) {
      localStorage.setItem("lockedPlayers", JSON.stringify(lockedPlayers));
    }
  }, [lockedPlayers]);

  useEffect(() => {
    if (!socket) return;

    const handleShowRightAnswer = (showAnswer) => {
      setShowRightAnswer(showAnswer);
    };

    socket.on("showRightAnswerNow", handleShowRightAnswer);

    return () => {
      socket.off("showRightAnswerNow", handleShowRightAnswer);
    };
  }, [socket]);

  // Play a random buzzer sound effect and show banner when a player buzzes
  useEffect(() => {
    if (!socket) return;

    const handleBuzzerPressed = (payload) => {
      const audio = new Audio(
        `/sounds/sound${Math.floor(Math.random() * 6) + 1}.mp3`
      );

      audio.play().catch(() => {
        const userPrompt = window.confirm(
          "Möchtest du die automatische Audiowiedergabe für diese Seite zulassen?"
        );
        if (userPrompt) {
          audio.play();
        }
      });

      setShowBuzzeredUser(payload);
      setShowBuzzerAnimation(true);
      setTimeout(() => {
        setShowBuzzerAnimation(false);
      }, 3000);
    };

    socket.on("buzzerPressed", handleBuzzerPressed);

    return () => {
      socket.off("buzzerPressed", handleBuzzerPressed);
    };
  }, [socket]);

  // If a logged-in admin opens another admin's game link, sign them out so they can join as a guest
  useEffect(() => {
    if (!session?.user || !game) return;
    const adminId = String(game?.admin?._id || game?.admin || "");

    if (String(session.user.id) !== adminId && !session.user.isGuest) {
      signOut();
    }
  }, [session, game]);

  // Join the Socket.IO room as either admin watcher or participating guest player
  useEffect(() => {
    if (!gameByID || !session?.user || !socket || !queryId) return;

    const playerId = session.user.id;
    const username = session.user.username;
    const adminId = String(gameByID?.admin?._id || gameByID?.admin || "");

    if (!session.user.isGuest && String(playerId) === adminId) {
      socket.emit("watchGame", { gameId: queryId });
    } else {
      socket.emit("joinGame", { gameId: queryId, playerId, username });
    }
  }, [gameByID, session, socket, queryId]);

  // Subscribe to real-time game state updates
  useEffect(() => {
    if (!socket || !gameByID?._id) return;
    const gameId = gameByID._id;

    function handleGameUpdate({ game: updatedGame }) {
      setGame(updatedGame);
    }

    socket.on("gameUpdated", handleGameUpdate);
    socket.emit("getUpdatedGame", { gameId });

    return () => {
      socket.off("gameUpdated", handleGameUpdate);
    };
  }, [socket, gameByID]);

  if (!isReady || isLoading || !gameByID) return <Loading />;

  // Toggles the position lock on a draggable player badge in the admin view
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

  if (!game) return <Loading />;

  const adminId = String(game?.admin?._id || game?.admin || "");
  const isGameAdmin = !session.user.isGuest && String(session.user.id) === adminId;

  return (
    <>
      {showBuzzerAnimation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute top-10 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-2xl text-2xl font-bold shadow-2xl z-50"
        >
          🚨 {showBuzzeredUser?.username || showBuzzeredUser} hat gebuzzert!
        </motion.div>
      )}

      {!isGameAdmin && (
        <div className="absolute top-1/2 left-1/2 lg:w-7/8 lg:h-9/10 w-full h-full flex flex-col justify-center items-center border bg-gray-900 rounded-2xl shadow-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden text-white">
          <GuestView session={session} showrightAnswer={showrightAnswer} />
        </div>
      )}

      {isGameAdmin && (
        <div className="absolute top-0 left-1/2 lg:w-3/4 lg:h-3/4 w-full h-full flex flex-col justify-center items-center border bg-gray-900 rounded-2xl shadow-2xl -translate-x-1/2 overflow-hidden text-white">
          <AdminView
            players={players}
            gameByID={game}
            session={session}
            handleStartGame={handleStartGame}
            showrightAnswer={showrightAnswer}
            setShowRightAnswer={setShowRightAnswer}
          />
        </div>
      )}

      {isGameAdmin &&
        game?.players?.map((player) => {
          const playerKey = player.username;
          return (
            <motion.div
              drag={!lockedPlayers[playerKey]?.locked}
              key={player.playerId?._id || playerKey}
              animate={{
                x: lockedPlayers[playerKey]?.x || 0,
                y: lockedPlayers[playerKey]?.y || 0,
              }}
              onDragEnd={(event, info) => {
                setLockedPlayers((prev) => {
                  const prevPlayer = prev[playerKey] || {
                    x: 0,
                    y: 0,
                    locked: false,
                  };

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
              className={`absolute z-40 text-lg text-gray-200 ${
                lockedPlayers[playerKey]?.locked ? "bg-violet-700" : "bg-gray-600"
              } p-2 rounded-md cursor-move mb-2`}
            >
              {player.username}{" "}
              {player?.playerId?.points !== undefined
                ? `/ P: ${player.playerId.points}`
                : ""}
              <button
                onClick={() => toggleLock(playerKey)}
                className="ml-2 px-2 py-1 bg-white text-black rounded cursor-pointer"
              >
                {lockedPlayers[playerKey]?.locked ? "Unlock" : "Lock"}
              </button>
            </motion.div>
          );
        })}
    </>
  );
}
