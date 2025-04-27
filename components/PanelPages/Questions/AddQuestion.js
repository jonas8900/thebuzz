import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Loading from "../../Status/Loading";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export default function AddQuestions() {
    const { data: session } = useSession();
    const { data, isLoading } = useSWR("/api/game/getGames");
    const { data: chosenGameObject } = useSWR("/api/game/getChosenGame");
    const [answers, setAnswers] = useState([""]);
    const [openAnswer, setOpenAnswer] = useState("");
    const [openAnswerPoints, setOpenAnswerPoints] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [question, setQuestion] = useState("");
    const [mode, setMode] = useState("truefalse"); 
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
        
    if (!data) return null;
    if (!chosenGameObject) return null;
    const chosenGame = chosenGameObject.chosenGame;

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

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const backendData = Object.fromEntries(formData.entries());

        let questionData = {};

        if (mode === "truefalse") {
            questionData = {
                question: backendData.question,
                correctanswer: backendData.checkboxtruefalse != null ? "true" : "false",
                mode: mode,
                gameId: chosenGame._id,
                points: backendData.Points,
                pointsgiven: false,
            };
        }

        if (mode === "multiple") {
            questionData = {
                question: backendData.question,
                correctanswer: backendData.Answer,
                mode: mode,
                gameId: chosenGame._id,
                points: backendData.Points,
                answers: answers,
                pointsgiven: false,
            }
        }

        if (mode === "open") {
            questionData = {
                question: backendData.question,
                correctanswer: backendData.Answer,
                mode: mode,
                gameId: chosenGame._id,
                points: backendData.Points,
                pointsgiven: false,
            };
        }

        if (mode === "buzzer") {
            questionData = {
                question: backendData.question,
                correctanswer: backendData.Answer,
                mode: mode,
                gameId: chosenGame._id,
                points: backendData.Points,
                pointsgiven: false,
            };
        }

        if (mode === "picture") {

            const formDataWithFile = new FormData();
              
            if (file) {
                if (file instanceof Blob) {
                    const fileWithCorrectType = new File([file], file.name, { type: file.type });
                    formDataWithFile.set("image", fileWithCorrectType); 
                } else {
                    formDataWithFile.set("image", file); 
                }
            }
            console.log(mode);
            formDataWithFile.append("image", file);
            formDataWithFile.append("question", backendData.question);
            formDataWithFile.append("correctanswer", backendData.Answer);
            formDataWithFile.append("mode", mode);
            formDataWithFile.append("gameId", chosenGame._id);
            formDataWithFile.append("points", backendData.Points);
            formDataWithFile.append("pointsgiven", false);

            const response = await fetch("/api/game/questions/createQuestionWithFile", {
                method: "POST",
                body: formDataWithFile,
            });
            
            if(!response.ok) {
                const errorData = await response.json();
                setToastMessage(errorData.message);
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                    setToastMessage("");
                }, 3000);
    
            } else {
                const successData = await response.json();
                setToastMessage(successData.message);
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    setToastMessage("");
                }, 3000);
            }
    
            setQuestion("");
            setOpenAnswer("");
            setFile(null);
            fileInputRef.current.value = null;
            setOpenAnswerPoints("");
            setAnswers([""]);
        }
        
        if(mode !== "picture") {
        const response = await fetch("/api/game/questions/createQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({questionData}),
        });

        if(!response.ok) {
            const errorData = await response.json();
            setToastMessage(errorData.message);
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
                setToastMessage("");
            }, 3000);

        } else {
            const successData = await response.json();
            setToastMessage(successData.message);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setToastMessage("");
            }, 3000);
        }

        setQuestion("");
        setOpenAnswer("");
        setOpenAnswerPoints("");
        setAnswers([""]);
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

    async function handleImageUploadConverter(file) {
        const options = {
            maxSizeMB: 0.3,  
            quality: 0.8,    
            maxWidthOrHeight: 900, 
            useWebWorker: true,  
            fileType: "image/webp",  
            preserveExif: true, 
        };
    
        try {
            const compressedBlob = await imageCompression(file, options);
            const compressedFile = new File([compressedBlob], file.name, { type: compressedBlob.type });
    
            return compressedFile; 
        } catch (error) {
            console.error("Fehler bei der Komprimierung:", error);
            return file; 
        }
      }

      function handleFileChange(event) {
        const selectedFile = event.target.files[0];
    
        if (selectedFile) {
          if (selectedFile.size > 10 * 1024 * 1024) {
            alert("Datei ist zu groß. Maximale Größe ist 10MB.");
            return;
          }
    
          handleImageUploadConverter(selectedFile).then(compressedFile => {
            setFile(compressedFile);  
          });
        }
      }

    return (
        <>
        {chosenGame ? (
            <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
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
                                    onChange={handleFileChange}
                                    ref={fileInputRef} 
                                />
                                <label
                                    htmlFor="imageUpload"
                                    className="absolute left-2 text-sm text-gray-500 dark:text-gray-400"
                                    
                                >
                                    Bild hochladen
                                </label>
                                {file ? (
                                    <div className="relative w-2/4 mt-4 mx-auto"> 
                                        <Image
                                            src={URL.createObjectURL(file)}
                                            alt="Vorschau"
                                            width={200}
                                            height={200}
                                            className="object-contain w-full h-auto rounded-lg"
                                        />
                                        
                                        <button
                                            onClick={() => setFile(null)} 
                                            className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                     </div>
                                

                                    ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <svg
                                        className="w-12 h-12 mb-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16V4m0 0l-4 4m4-4l4 4m5 12h2a2 2 0 002-2v-7a2 2 0 00-2-2h-2.586a1 1 0 01-.707-.293l-1.414-1.414a1 1 0 00-.707-.293H9a2 2 0 00-2 2v10a2 2 0 002 2h2"
                                        />
                                        </svg>
                                    </div>
                                    )}
                                <div className="relative w-full mt-4">
                                    <input
                                    type="text"
                                    id="Answer"
                                    name="Answer"
                                    placeholder=" "
                                    required
                                    value={openAnswer}  
                                    onChange={(e) => setOpenAnswer(e.target.value)}  
                                    className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />
                                    <label
                                    htmlFor="Answer"
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
                                <div className="relative w-1/4 mt-4">
                                    <input 
                                        type="number"
                                        id="Points"
                                        name="Points"
                                        placeholder=" "
                                        required
                                        value={openAnswerPoints}
                                        onChange={(e) => setOpenAnswerPoints(e.target.value)}
                                        className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />

                                    <label
                                        htmlFor="Points"
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                            ${openAnswerPoints ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                        Punkte
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
                                    htmlFor="checkboxtruefalse"
                                    className=" text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Ist diese Frage wahr?
                                </label>
                                <input
                                    type="checkbox"
                                    id="checkboxtruefalse"
                                    name="checkboxtruefalse"
                                    className=" ml-4 border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    
                                />
                            </div>
                            <div className="relative w-1/4 mt-4">
                                    <input 
                                        type="number"
                                        id="Points"
                                        name="Points"
                                        placeholder=" "
                                        required
                                        value={openAnswerPoints}
                                        onChange={(e) => setOpenAnswerPoints(e.target.value)}
                                        className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />

                                    <label
                                        htmlFor="Points"
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                            ${openAnswerPoints ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                        Punkte
                                    </label>
                                </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Wenn diese Option aktiviert ist, wird die Antwort als wahr betrachtet. Andernfalls wird sie als falsch betrachtet.
                            </p>
                        </>
                        
                    )}

                    {mode === "multiple" && (
                        <>
                          {answers.map((answer, index) => {
                            return (
                                <div key={index}
                                    className="relative w-full">
                                <input
                                    type="text"
                                    id={`Answer${index + 1}`}
                                    name={`Answer${index + 1}`}
                                    required
                                    placeholder=" "
                                    value={answer}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                                <label
                                    htmlFor={`Answer${index + 1}`}
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
                            );
                            }
                            )}


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
                                    id="Answer"
                                    name="Answer"
                                    className="p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                >
                                    {answers.map((answer, index) => (
                                        <option key={index} value={index}>
                                        Antwort {index + 1}
                                        </option>
                                    ))}
                                </select>
                                <label
                                    htmlFor="Answer"
                                    className="absolute left-2 text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Richtige Antwort
                                </label>
                            </div>
                            <div className="relative w-1/4 mt-4">
                                    <input 
                                        type="number"
                                        id="Points"
                                        name="Points"
                                        placeholder=" "
                                        required
                                        value={openAnswerPoints}
                                        onChange={(e) => setOpenAnswerPoints(e.target.value)}
                                        className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />

                                    <label
                                        htmlFor="Points"
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                            ${openAnswerPoints ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                        Punkte
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
                            <input
                                type="text"
                                id="Answer"
                                name="Answer"
                                placeholder=" "
                                value={openAnswer}  
                                required
                                onChange={(e) => setOpenAnswer(e.target.value)}  
                                className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                            />
                            <label
                                htmlFor="Answer"
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
                            <div className="relative w-1/4 mt-4">
                                    <input 
                                        type="number"
                                        id="Points"
                                        name="Points"
                                        placeholder=" "
                                        required
                                        value={openAnswerPoints}
                                        onChange={(e) => setOpenAnswerPoints(e.target.value)}
                                        className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />

                                    <label
                                        htmlFor="Points"
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                            ${openAnswerPoints ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                        Punkte
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                   Hier zählt schnelligkeit! Der Spieler muss so schnell wie möglich auf den Buzzer drücken und die Antwort geben.
                                   <strong><br /><br />Beispiel: Wer ist der Präsident von Deutschland? </strong>
                                   Hat der Spieler die Antwort richtig gegeben
                                </p>

                            </>
                    )}    
                    {mode === "open" && (
                        <>
                            <div className="relative w-full">

                                <input
                                type="text"
                                id="Answer"
                                name="Answer"
                                placeholder=" "
                                required
                                value={openAnswer}  
                                onChange={(e) => setOpenAnswer(e.target.value)}  
                                className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                />
                                <label
                                htmlFor="Answer"
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
                            <div className="relative w-1/4 mt-4">
                                    <input 
                                        type="number"
                                        id="Points"
                                        name="Points"
                                        placeholder=" "
                                        required
                                        value={openAnswerPoints}
                                        onChange={(e) => setOpenAnswerPoints(e.target.value)}
                                        className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white rounded focus:outline-none"
                                    />

                                    <label
                                        htmlFor="Points"
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                                            ${openAnswerPoints ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                        Punkte
                                    </label>
                                </div>

                       
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Diese Frage erfordert eine offene Antwort. Der Spieler muss seine Antwort manuell eingeben, und du deckst anschließend deine Lösung auf und entscheidest, wer am nächsten dran ist.
                                <strong><br /><br />Beispiel: Schätze, wie viele Einwohner Japan vor 20 Jahren hatte.</strong>
                            </p>

                        </>
                    )}


                    <button type="submit" className="bg-blue-500 text-white p-2 mb-8 rounded">Frage hinzufügen</button>
                </form>
            </div>
            ) : (
                <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                    <h1 className="text-2xl font-bold mb-4">Kein Spiel ausgewählt</h1>
                    <p className="text-gray-500">Bitte wähle ein Spiel aus, um Fragen hinzuzufügen.</p>
                    <p className="text-gray-500">Gehe dazu in Spiel Erstellen und wähle das Spiel aus oder wähle im Menüpunkt das aktuelle Spiel aus, wenn du mehr als ein Spiel hast.</p>
                </div>
            )}
                  {showError && <ErrorMessage message={toastMessage} />}
                  {showSuccess && <SuccessMessage message={toastMessage} />}
        </>
    );
}
