import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";
import useSWR, { mutate } from "swr";
import Loading from "../../Status/Loading";

export default function AddGame() {
  const { data: session } = useSession();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameInput, setGameInput] = useState("");
  const { data } = useSWR("/api/game/getGames");
  const { data: chosenGame, isLoading } = useSWR("/api/game/getChosenGame");

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  if (!data) {
    return null;
  }

  if (isLoading) return <Loading />;

  function triggerError(msg = "Etwas ist schiefgelaufen!") {
    setShowError(true);
    setToastMessage(msg);
    setTimeout(() => {
      setShowError(false);
      setToastMessage("");
    }, 3000);
  }

  function triggerSuccess(msg) {
    setShowSuccess(true);
    setToastMessage(msg);
    setTimeout(() => {
      setShowSuccess(false);
      setToastMessage("");
    }, 3000);
  }

  async function handleAddGame(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const gameName = formData.get("gameName");

    const response = await fetch("/api/game/createGameAsAdmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: gameName }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      triggerError(result.error || result.message || "Etwas ist schiefgelaufen!");
      return;
    }

    setGameInput("");
    event.target.reset();
    triggerSuccess("Spiel erstellt! 🎉");
    mutate("/api/game/getGames");
    mutate("/api/game/getChosenGame");
  }

  async function handleDeleteGame(gameId) {
    const response = await fetch("/api/game/deleteGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId }),
    });

    if (!response.ok) {
      triggerError("Etwas ist schiefgelaufen!");
      return;
    }

    triggerSuccess("Spiel gelöscht! 🎉");
    mutate("/api/game/getGames");
    mutate("/api/game/getChosenGame");
  }

  async function handleChangeGame(selectedGameId) {
    const response = await fetch("/api/game/changeGame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedGameId }),
    });

    if (!response.ok) {
      triggerError("Etwas ist schiefgelaufen!");
      return;
    }

    triggerSuccess("Spiel gewechselt! 🎉");
    mutate("/api/game/getGames");
    mutate("/api/game/getChosenGame");
  }

  return (
    <>
      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}

      {data || chosenGame ? (
        <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 pt-12 rounded-lg overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Neues Spiel hinzufügen</h1>
          <form className="flex flex-col space-y-4" onSubmit={handleAddGame}>
            <div className="relative w-full h-12">
              <input
                type="text"
                id="spielname"
                name="gameName"
                required
                placeholder=" "
                value={gameInput}
                onChange={(e) => setGameInput(e.target.value)}
                className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <label
                htmlFor="spielname"
                className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                  ${gameInput ? "top-[-8px] bg-gray-900 pr-2 pl-2 text-xs" : "top-1/2 transform -translate-y-1/2"} 
                  peer-placeholder-shown:text-sm 
                  peer-placeholder-shown:text-gray-500 
                  peer-focus:text-xs 
                  peer-focus:text-blue-500 
                  peer-focus:dark:text-blue-500`}
              >
                Spielname
              </label>
            </div>
            <button type="submit" className="bg-blue-500 cursor-pointer text-white p-2 rounded">
              Spiel hinzufügen
            </button>
          </form>

          <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mt-4">
            <h2 className="text-2xl font-bold mb-4">Deine Spiele als Admin:</h2>
            <ul className="space-y-2">
              {Array.isArray(data) && data.length > 0 ? (
                data.map((game) => (
                  <li key={game._id} className="p-2 border rounded flex items-center justify-between mb-4">
                    <span>{game.name}</span>

                    <div className="space-x-2">
                      {data.length === 1 && (
                        <button
                          onClick={() => handleChangeGame(game._id)}
                          className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded hover:bg-blue-600 active:bg-blue-900 transition duration-200"
                        >
                          Wechseln
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteGame(game._id)}
                        className="px-4 py-2 bg-red-500 text-white cursor-pointer rounded hover:bg-red-600 active:bg-blue-900 transition duration-200"
                      >
                        Löschen
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p>Keine Spiele vorhanden.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 pt-12 rounded-lg overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Keine Spieldaten</h1>
        </div>
      )}
    </>
  );
}
