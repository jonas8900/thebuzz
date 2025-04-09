import { useState } from "react";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Loading from "../../Status/Loading";

export default function AddQuestions() {
    const { data: session } = useSession();
    const { data, isLoading } = useSWR("/api/game/getGames");
    const [answers, setAnswers] = useState([""]);
    const [openAnswer, setOpenAnswer] = useState("");
    const [question, setQuestion] = useState("");
    const [mode, setMode] = useState("truefalse"); 

    if (!data) return null;

    if (data.message) {
        return (
        <div className="flex justify-center items-center w-full h-full">
            <p className="text-gray-500">{data.message}</p>
        </div>
        );
    }

    if (isLoading) {
        return <Loading/>
    }

    if (!session) return null;

    function handleAddAnswer() {
        if (answers.length < 4) {
            setAnswers([...answers, ""]);
        }
    }

    function handleDeleteAnswer() {
        if (answers.length > 1) {
            const updatedAnswers = [...answers];
            updatedAnswers.pop(); 
            setAnswers(updatedAnswers);
        }
    }

    function handleAnswerChange(index, value) {
        const updatedAnswers = [...answers];
        updatedAnswers[index] = value;
        setAnswers(updatedAnswers);
    }



    function handleModeChange(e) {
        setMode(e.target.value);
    }

    return (
        <>
            <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-lg">
                <form className="flex flex-col space-y-4">
                    <div className="lg:w-full w-1/2 left-0 pr-0 bg-gray-100 dark:bg-gray-900">
                        <h2 className="text-2xl font-bold mb-4">Modus</h2>
                        <select
                            className="p-2 mt-2 border w-full rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
                            value={mode}
                            onChange={handleModeChange}
                        >
                            <option value="truefalse">Wahr/Falsch</option>
                            <option value="open">Offene Frage</option>
                            <option value="picture">Bilderfrage</option>
                            <option value="multiple">Multiple Antwort</option>
                            <option value="buzzer">Buzzer Antwort</option>
                        </select>
                    </div>

                    <h1 className="text-2xl font-bold mb-4">Fragen hinzufügen</h1>
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="question"
                            name="question"
                            required
                            placeholder=" "
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <label
                            htmlFor="question"
                            className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
                                ${question ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                peer-focus-shown:top-[-8px]
                                peer-placeholder-shown:text-sm 
                                peer-placeholder-shown:text-gray-500 
                                peer-focus:text-xs 
                                peer-focus:text-blue-500 
                                peer-focus:dark:text-blue-500`}
                        >
                            Frage
                        </label>
                    </div>

                    {mode === "picture" && (
                        <>
                            <div className="relative w-full">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    name="imageUpload"
                                    accept="image/*"
                                    className="p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                />
                                <label
                                    htmlFor="imageUpload"
                                    className="absolute left-2 text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Bild hochladen
                                </label>
                                <div className="relative w-full mt-4">
                                    <input
                                    type="text"
                                    id="openAnswer"
                                    name="openAnswer"
                                    placeholder=" "
                                    value={openAnswer}  
                                    onChange={(e) => setOpenAnswer(e.target.value)}  
                                    className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />
                                    <label
                                    htmlFor="openAnswer"
                                    className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                        ${openAnswer ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                        peer-placeholder-shown:text-sm 
                                        peer-placeholder-shown:text-gray-500 
                                        peer-focus:text-xs 
                                        peer-focus:text-blue-500 
                                        peer-focus:dark:text-blue-500`}
                                    >
                                    Antwort
                                    </label>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Hier bestimmst du selbst die Antwort und die Lösung. Der Spieler muss das Bild sehen und die Antwort manuell eingeben.
                                Danach kannst du dem Spieler, der die beste Antwort geliefert hat die Punkte geben. Sollten mehrere Spieler die gleiche Antwort abgegeben haben, kannst du beiden die Punkte geben. 
                            </p>
                        </>
                    )}

                    {mode === "truefalse" && (
                        <>
                            <div className="relative w-full flex items-center align-center">
                               
                                <label
                                    htmlFor="true"
                                    className=" text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Ist diese Antwort wahr?
                                </label>
                                <input
                                    type="checkbox"
                                    id="true"
                                    name="truefalse"
                                    className=" ml-4 border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Wenn diese Option aktiviert ist, wird die Antwort als wahr betrachtet. Andernfalls wird sie als falsch betrachtet.
                            </p>
                        </>
                        
                    )}

                    {mode === "multiple" && (
                        <>
                            {answers.map((answer, index) => (
                                <div key={index} className="relative w-full">
                                    <input
                                        type="text"
                                        id={`answer${index + 1}`}
                                        name={`answer${index + 1}`}
                                        required
                                        placeholder=" "
                                        value={answer}
                                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                                        className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                    <label
                                        htmlFor={`answer${index + 1}`}
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                            ${answer ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                        Antwort {index + 1}
                                    </label>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={handleAddAnswer}
                                className="self-start cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                            >
                                + Weitere Antwort
                            </button>
                            {answers.length > 1 && (
                                <button
                                    type="button"
                                    onClick={handleDeleteAnswer}
                                    className="self-start cursor-pointer text-blue-500 hover:text-blue-700 transition duration-200"
                                >
                                    - Antwort entfernen
                                </button>
                            )}
                            <div className="relative w-full">
                                <select
                                    id="correctAnswer"
                                    name="correctAnswer"
                                    className="p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                >
                                    {answers.map((index) => (
                                        <option key={index} value={index + 1}>
                                            Antwort {index + 1}
                                        </option>
                                    ))}
                                </select>
                                <label
                                    htmlFor="correctAnswer"
                                    className="absolute left-2 text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Richtige Antwort
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Hier gibt es viele Varianten. Du kannst eine Frage stellen und theoretisch nur eine Antwort geben (diese wird den Spielern angezeigt). Das Spielprinzip ist hierhinter eigentlich, 
                                dass der Spieler 4 Antwortmöglichkeiten sieht, eine Antwort gibt und du als Admin die gegebenen Antworten siehst und zu deinem Zeitpunkt die Antwort aufdeckst. 
                            </p>

                        </>
                    )}
                    {mode === "buzzer" && (
                       <>
                            <div className="relative w-full">

                            </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                   Hier zählt schnelligkeit! Der Spieler muss so schnell wie möglich auf den Buzzer drücken und die Antwort geben.
                                   <strong><br /><br />Beispiel: Wer ist der Präsident von Deutschland?</strong>
                                   Hat der Spieler die Antwort richtig gegeben
                                </p>

                            </>
                    )}    
                    {mode === "open" && (
                        <>
                            <div className="relative w-full">
                                <input
                                type="text"
                                id="openAnswer"
                                name="openAnswer"
                                placeholder=" "
                                value={openAnswer}  
                                onChange={(e) => setOpenAnswer(e.target.value)}  
                                className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                />
                                <label
                                htmlFor="openAnswer"
                                className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                    ${openAnswer ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                    peer-placeholder-shown:text-sm 
                                    peer-placeholder-shown:text-gray-500 
                                    peer-focus:text-xs 
                                    peer-focus:text-blue-500 
                                    peer-focus:dark:text-blue-500`}
                                >
                                Antwort
                                </label>

                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Diese Frage erfordert eine offene Antwort. Der Spieler muss seine Antwort manuell eingeben, und du deckst anschließend deine Lösung auf und entscheidest, wer am nächsten dran ist.
                                <strong><br /><br />Beispiel: Schätze, wie viele Einwohner Japan vor 20 Jahren hatte.</strong>
                            </p>

                        </>
                    )}


                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">Frage hinzufügen</button>
                </form>
            </div>
        </>
    );
}
