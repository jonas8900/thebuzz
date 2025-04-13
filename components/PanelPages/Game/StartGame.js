import { useSession } from "next-auth/react";
import BigRedBuzzer from "../../Buttons/RedBuzzer";
import useSWR from "swr";
import { useRouter } from "next/router";
import Loading from "../../Status/Loading";
import { usePlayerSocket } from "../../context/playerContext";







export default function StartGame() {
    const { data: session } = useSession();
    const { data, error, isLoading, mutate } = useSWR("/api/game/getChosenGame");
      const { players } = usePlayerSocket();
    const router = useRouter()
    console.log(players, 'players in startgame')


    if(!session) {
        return null;
    };


    if(isLoading) return <Loading/>;

    return(
        <>
            <div>
                <h1 className="text-xl font-semibold mb-4">Aktuelle Spieler in der Warteschlange:</h1>
                <ul className="flex flex-wrap gap-4">
                    {players.map((player) => (
                        <li key={player._id} className="bg-green-500 p-4 rounded-lg shadow-md">{player.username}</li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col items-center justify-center h-full w-full">
                <BigRedBuzzer/>
            </div>
        </>
    );
}