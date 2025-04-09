import { useSession } from "next-auth/react";
import BigRedBuzzer from "../../Buttons/RedBuzzer";
import useSWR from "swr";
import { useRouter } from "next/router";
import Loading from "../../Status/Loading";

export default function StartGame() {
    const { data: session } = useSession();
    const { data, error, isLoading, mutate } = useSWR("/api/game/getChosenGame");
    const router = useRouter()
    // const game = data?.game;
    // const players = data?.players;
    // const gameId = data?.game?._id;
    console.log(session);


    if(!session) {
        return null;
    };


    // if(!game) return null;


    if(isLoading) return <Loading/>;

    return(
        <>
            <div>
                <h1 className="text-xl font-semibold mb-4">Aktuelle Spieler in der Warteschlange:</h1>
                <ul className="flex flex-wrap gap-4">
                    <li className="bg-red-500 p-4 rounded-lg shadow-md">asd</li>
                    <li className="bg-red-500 p-4 rounded-lg shadow-md">asd</li>
                    <li className="bg-red-500 p-4 rounded-lg shadow-md">asd</li>
                    <li className="bg-green-500 p-4 rounded-lg shadow-md">asd</li>
                </ul>
            </div>
            <div className="flex flex-col items-center justify-center h-full w-full">
                <BigRedBuzzer/>
            </div>
        </>
    );
}