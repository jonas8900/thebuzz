import { useState } from "react";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR from "swr";

export default function AddQuestions() {
    const { data: session } = useSession();
    const { data, isLoading } = useSWR("/api/game/getChosenGame");
    const [answers, setAnswers] = useState([""]);
    const [openAnswer, setOpenAnswer] = useState("");
    const [question, setQuestion] = useState("");
    const [mode, setMode] = useState("truefalse"); 

    if (!data) return null;

    if (data.message) {
        return (
        <div className="flex justify-center items-center w-full h-full">
            <p className="text-red-500">{data.message}</p>
        </div>
        );
    }

    if (isLoading) {
        return (
        <div className="flex justify-center items-center w-full h-full">
            <Loader className="h-10 w-10 animate-spin text-blue-500" />
        </div>
        );
    }

    if (!session) return null;

    console.log(data)

    return (
        <>
         <div className="flex flex-col gap-4 w-full h-full p-4">
                <div className="flex flex-col gap-4 w-full h-full p-4">
                {data.chosenGame ? (
                        <div>
                            <div key={data.chosenGame._id} className="flex flex-col gap-2 w-full h-full p-4 border border-gray-300 rounded-lg shadow-md">
                                <h2 className="text-xl font-bold">{data.chosenGame.name}</h2>
                                <p className="text-gray-200">Fragen: {data.chosenGame.questions.length}</p>
                            
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center w-full h-full">
                            <p className="text-gray-500">Keine Spiele gefunden, lege erst Spiele an um Fragen zu sehen</p>
                        </div>
                    )}
                </div>
        </div>
        </>
    );
}
