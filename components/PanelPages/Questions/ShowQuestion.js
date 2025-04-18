import { useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import Loading from "../../Status/Loading";
import { motion, AnimatePresence } from "framer-motion";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";

export default function AddQuestions() {
    const { data: session } = useSession();
    const { data, isLoading, mutate } = useSWR("/api/game/getChosenGame");
    const [answers, setAnswers] = useState([""]);
    const [openAnswers, setOpenAnswers] = useState(false);
    const [modalopen, setModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [question, setQuestion] = useState("");
    const [mode, setMode] = useState("truefalse"); 
    const overlayJoinRef = useRef(null);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
    
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    if (isLoading) {
        return <Loading/>
    }

    if (!session) return null;


    function handleClickOutside(e) {
        if (
            overlayJoinRef.current &&
          !overlayJoinRef.current.contains(e.target)
        ) {
            setModalOpen(false);
        }
      }

    function handleOpenAnswer() {
        setModalOpen(false);
        setOpenAnswers(true);
    }

    async function handleDeleteQuestion(id) {
        const response = await fetch("/api/game/questions/deleteQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
        });


        if (response.ok) {
            setShowSuccess(true);
            setToastMessage("Frage gelöscht! 🎉")
            setTimeout(() => {
                setShowSuccess(false);
                setToastMessage("");
            }, 3000);
            mutate("/api/game/getChosenGame");
        }
        else {
            setShowError(true);
            setToastMessage("Etwas ist schiefgelaufen!");
            setTimeout(() => {
                setShowError(false);
                setToastMessage("");
            }, 3000);
            mutate("/api/game/getChosenGame");
        }

    }


    return (
        <div>
         <div className="flex flex-col gap-4 w-full h-full p-4 relative">
                <div className="flex flex-col gap-4 w-full h-full p-4">
                    {data.chosenGame ? (
                        <>
                            <div>
                                <div key={data.chosenGame._id} className="flex flex-col gap-2 w-full h-full p-4 border border-gray-300 rounded-lg ">
                                    <h2 className="text-xl font-bold">{data.chosenGame.name}</h2>
                                    <p className="text-gray-200">Fragen: {data.chosenGame.questions.length}</p>
                                
                                </div>
                            </div>
                        
                            {openAnswers ? (
                                <div className="flex flex-col gap-4 w-full h-full">
                                    <div className="flex flex-col gap-6 w-full  border-gray-300 rounded-lg ">
                                        <h2 className="text-xl font-bold">Fragen</h2>
                                        {data.chosenGame.questions.map((question) => {
                                        
                                        return( 
                                              <div key={question._id} className="relative flex flex-col gap-2 w-full h-full p-4 border border-gray-300 rounded-lg shadow-md">
                                                    <button
                                                        onClick={() => handleDeleteQuestion(question._id)}
                                                        className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                                                    >
                                                        Löschen
                                                    </button>

                                                    <p className="text-gray-200 font-bold">{question.question}</p>

                                                    {question.answers && question.answers.length > 0 && (
                                                        <ul className="list-disc pl-5">
                                                            {question.answers.map((answer, index) => (
                                                                <li key={index} className="text-gray-200">{answer}</li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    {question.correctanswer && (
                                                        <>
                                                            {question.mode === "multiple" ? (
                                                                <p className="text-red-300">Richtige Antwort: {question.correctanswer}</p>
                                                            ) : (
                                                                <p className="text-red-300">Richtige Antwort: {question.correctanswer}</p>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button className="bg-red-500 cursor-pointer text-white  p-2 rounded" onClick={() => setOpenAnswers(false)}>Fragen ohne Antworten anzeigen</button>
                                </div>
                            ) : (
                                <>
                                    <button className="bg-blue-500 cursor-pointer text-white p-2 rounded" onClick={() => setModalOpen(true)}>Fragen mit Antworten anzeigen</button>
                                    <p className="text-gray-200 dark:text-gray-500 ">Achtung, wird dieser Button gedrückt werden alle Fragen und Antworten angezeigt</p>
                                </>
                            )}
                            <AnimatePresence>
                                {modalopen && (
                                    <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                                    >
                                        <div
                                            ref={overlayJoinRef}
                                            className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                                        >
                                        
                                            <button
                                            onClick={() => setModalOpen(false)}
                                            className="absolute top-4 right-4 text-gray-600 cursor-pointer dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                            >
                                            ✕
                                            </button>

                                        
                                            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                                            Fragen anzeigen?
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                            Achtung, wenn du fortfährst, werden alle Fragen und Antworten für den Stream sichtbar!
                                            </p>

                                            <div className="flex justify-end space-x-3">
                                            <button
                                                className="px-4 py-2 cursor-pointer rounded bg-gray-200 dark:bg-red-500 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                                                onClick={() => setModalOpen(false)}
                                            >
                                                Abbrechen
                                            </button>
                                            <button
                                                className="px-4 py-2 rounded cursor-pointer bg-green-600 text-white hover:bg-green-700 transition"
                                                onClick={handleOpenAnswer}
                                            >
                                                Anzeigen
                                            </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </>
                        ) : (
                            <div className="flex justify-center items-center w-full h-full">
                                <p className="text-gray-500">Keine Spiele gefunden, lege erst Spiele an um Fragen zu sehen</p>
                            </div>
                        )}
                </div>
        </div>
            {showError && <ErrorMessage message={toastMessage} />}
            {showSuccess && <SuccessMessage message={toastMessage} />}
        </div>
    );
}
