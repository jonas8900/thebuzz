import { useSession } from "next-auth/react";
import BigRedBuzzer from "../../Buttons/RedBuzzer";
import useSWR from "swr";
import Loading from "../../Status/Loading";
import { usePlayerSocket } from "../../context/playerContext";
import { useEffect, useState } from "react";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";

export default function StartGame() {
  const { data: session } = useSession();
  const { data, isLoading, mutate } = useSWR("/api/game/getChosenGame");
  const { players, socket } = usePlayerSocket();
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (data?.chosenGame?._id && socket) {
      socket.emit("watchGame", { gameId: data.chosenGame._id });
    }
  }, [data, socket]);

  if (!data || !session) return null;
  if (isLoading) return <Loading />;

  async function handleKickPlayer(playerId) {
    const gameId = data.chosenGame._id;

    const response = await fetch("/api/game/kick/deleteTemporaryUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playerId, gameId }),
    });

    if (response.ok) {
      if (socket) {
        socket.emit("kickPlayer", { gameId, playerId });
      }
      setShowSuccess(true);
      setToastMessage("Spieler gekickt! 🎉");
      mutate("/api/game/getChosenGame");
      setTimeout(() => {
        setShowSuccess(false);
        setToastMessage("");
      }, 3000);
    } else {
      setShowError(true);
      setToastMessage("Etwas ist schiefgelaufen!");
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 3000);
    }
  }

  function generateRandomString() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  function handleRouting() {
    const authString = generateRandomString();
    const xdle = generateRandomString();
    let inviteUrl = data.chosenGame.invitelink;
    try {
      const parsed = new URL(inviteUrl, window.location.origin);
      inviteUrl = `${window.location.origin}${parsed.pathname}${parsed.search}`;
    } catch {
      // Fallback to raw invitelink if URL parsing fails
    }
    const url = `${inviteUrl}&auth=${authString}&xdle=${xdle}`;
    window.open(url, "_blank");
  }

  return (
    <>
      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}
      <div>
        <h1 className="text-xl font-semibold mb-4">Aktuelle Spieler in der Warteschlange:</h1>
        <ul className="flex flex-wrap gap-4">
          {players?.length > 0 &&
            players.map((player) => (
              <li
                key={player.playerId}
                className="bg-green-500 p-4 rounded-lg shadow-md flex items-center gap-4"
              >
                <span className="text-white font-medium">{player.username}</span>
                {player.playerId !== session.user.id && (
                  <button
                    onClick={() => handleKickPlayer(player.playerId)}
                    className="z-10 bg-red-600 text-white cursor-pointer px-2 py-1 h-full rounded hover:bg-red-700"
                  >
                    Kick
                  </button>
                )}
              </li>
            ))}
        </ul>
      </div>
      {data?.chosenGame?.invitelink ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <BigRedBuzzer onClick={handleRouting}>STARTEN</BigRedBuzzer>
        </div>
      ) : (
        <div className="flex flex-col mt-8 text-red-500">
          <h2>Generiere erst einen Einladungslink, bevor du das Spiel starten kannst</h2>
        </div>
      )}
    </>
  );
}
