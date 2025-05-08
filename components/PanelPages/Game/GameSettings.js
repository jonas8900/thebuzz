import { useSession } from "next-auth/react";
import { useState } from "react";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";
import useSWR, { mutate } from "swr";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function GameSettings() {
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { data: session } = useSession();
  const { data, isLoading, error } = useSWR("/api/game/getChosenGame");
  const [showExplain, setShowExplain] = useState(false);

  const game = data?.chosenGame || null;
  const [sortedQuestions, setSortedQuestions] = useState([]);

  const gamemodes = ["random", "buzzergame", "lowtohigh", "sorted"];


  const handleChange = async (e) => {
    const newMode = e.target.value;

    try {
      const res = await fetch("/api/game/updateGameMode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game._id, gamemode: newMode }),
      });

      if (!res.ok) throw new Error("Fehler beim Aktualisieren des Modus");

      setToastMessage("Spielmodus aktualisiert");
      setShowSuccess(true);
      mutate("/api/game/getChosenGame");
    } catch (err) {
      setToastMessage(err.message);
      setShowError(true);
    }
  };

  async function handleReleaseUser(entry) {

    if (!entry) {
      setToastMessage("Kein User gefunden");
      setShowError(true);
      return;

    }
    if (!game) {
      setToastMessage("Kein Spiel gefunden");
      setShowError(true);
      return;
    }

    const userId = entry.user._id;

    try {
      const res = await fetch(`/api/game/kick/releaseUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, gameId: game._id }),
      });

      if (!res.ok) throw new Error("Fehler beim Freigeben des Users");

      setToastMessage("User freigegeben");
      setShowSuccess(true);
      mutate("/api/game/getChosenGame");
    } catch (err) {
      setToastMessage(err.message);
      setShowError(true);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sortedQuestions.findIndex(q => q._id === active.id);
      const newIndex = sortedQuestions.findIndex(q => q._id === over.id);
      const newOrder = arrayMove(sortedQuestions, oldIndex, newIndex);
      setSortedQuestions(newOrder);
    }
  };

  const saveSortedOrder = async () => {
    try {
      const questionIds = sortedQuestions.map(q => q._id);
      const res = await fetch("/api/game/questions/updateQuestionOrder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game._id, newQuestionOrder: questionIds }),
      });

      if (!res.ok) throw new Error("Fehler beim Speichern der Reihenfolge");

      setToastMessage("Fragenreihenfolge gespeichert");
      setShowSuccess(true);
      mutate("/api/game/getChosenGame");
    } catch (err) {
      setToastMessage(err.message);
      setShowError(true);
    }
  };

  if (game?.gamemode === "sorted" && sortedQuestions.length === 0 && game.questions?.length > 0) {
    setSortedQuestions(game.questions);
  }


  return (
    <>
      {game?.gamemode && game?.questions.length ? (
        <>
        {showError && <ErrorMessage message={toastMessage} />}
        {showSuccess && <SuccessMessage message={toastMessage} />}
        

        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <h1 className="text-2xl font-bold mb-4">Spielmodus einstellen</h1>
            <div className="mt-8">
            <div>
                <h2 className="text-lg font-semibold mb-2">Aktueller Spielmodus: {game?.gamemode}</h2>
            </div>
            <label className="mb-2 block text-gray-700 dark:text-gray-300">
            Wähle den Spielmodus:
            </label>
            <select
            className="p-4 mb-4 border w-full rounded bg-white dark:bg-gray-800 text-black dark:text-white"
            value={game?.gamemode}
            onChange={handleChange}
            disabled={!game}
            >
            {gamemodes.map((mode) => (
                <option key={mode} value={mode}>
                {mode}
                </option>
            ))}
            </select>

            <div className="mb-8 ">
                <h2 className="text-lg font-semibold mb-2">Blockierte Spieler</h2>
                <ul className="space-y-2">
                  {game.blockedusers.map((entry) => (
                    <li key={entry._id} className="flex justify-between items-center p-2 bg-gray-200 dark:bg-gray-800 rounded shadow">
                      <span>{entry.user?.username || "Unbekannter Benutzer"}</span>
                      <button
                        onClick={() => handleReleaseUser(entry)}
                        className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Freigeben
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            {game?.gamemode === "sorted" && (
            <>
                <h2 className="text-lg font-semibold mb-2">Fragen sortieren</h2>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedQuestions.map(q => q._id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                    {sortedQuestions.map((q) => (
                        <SortableItem key={q._id} id={q._id} question={q} />
                    ))}
                    </ul>
                </SortableContext>
                </DndContext>
                <button
                onClick={saveSortedOrder}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                Reihenfolge speichern
                </button>
            </>
            )}
            </div> 
            {!showExplain && (
                <button className="mt-24 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setShowExplain(true)}>Erklärung anzeigen</button>
            )}
            {showExplain && (
                <>
                    <button className="mt-24 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setShowExplain(false)}>Erklärung ausblenden</button>
                    <h2 className="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-white">Spielmodi erklärt</h2>
                    <div className="mt-8">
                    
                        <ul className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                            <li className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <strong className="block text-blue-600 dark:text-blue-400 mb-1">🎲 Random</strong>
                            Die Fragen werden in zufälliger Reihenfolge gestellt. Jede Spielrunde ist dadurch anders und unvorhersehbar.
                            Ideal für lockere Quizrunden ohne feste Struktur.
                            </li>

                            <li className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <strong className="block text-green-600 dark:text-green-400 mb-1">⏱️ Buzzergame</strong>
                            Die Frage wird gestellt und alle Spieler können buzzern. Wer am schnellsten reagiert, darf antworten.
                            Perfekt für schnelle Reaktionen und Wettkampfgefühl.
                            </li>

                            <li className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <strong className="block text-yellow-600 dark:text-yellow-400 mb-1">📊 Low to High</strong>
                            Die Fragen werden nach ihrer Punktebewertung sortiert – beginnend mit den einfacheren Fragen (niedrige Punkte),
                            gefolgt von den schwierigeren (höhere Punkte).
                            Gut geeignet für strukturierte Spiele mit steigendem Schwierigkeitsgrad.
                            </li>

                            <li className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <strong className="block text-purple-600 dark:text-purple-400 mb-1">🧩 Sorted</strong>
                            Du bestimmst die Reihenfolge der Fragen selbst per Drag & Drop. Diese Reihenfolge bleibt fest für das Spiel.
                            Ideal, wenn du eine gezielte Story oder ein bestimmtes Thema aufbauen willst.
                            </li>
                        </ul>
                    </div>

                    
                </>
            )}
        </div>
        </>
        ) : (
            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <h1 className="text-2xl font-bold mb-4">Spielmodus einstellen</h1>
                <p className="text-gray-700 dark:text-gray-300">Bitte wähle ein Spiel aus oder erstelle ein neues Spiel, um den Spielmodus zu ändern.</p>
            </div>
        )}
    </>
  );
}

function SortableItem({ id, question }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 p-4 rounded shadow cursor-move"
    >
      {question.question}
    </li>
  );
}
