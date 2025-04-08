import { useSession } from "next-auth/react";
import BigRedBuzzer from "../../Buttons/RedBuzzer";
import useSWR from "swr";
import { useRouter } from "next/router";
import Loading from "../../Status/Loading";

export default function StartGame() {
    const { session } = useSession();
    const { data, isLoading, mutate, error} = useSWR("api/game/getGameLinkAndPlayers");
    const router = useRouter()
    const game = data?.game;
    const players = data?.players;
    const gameId = data?.game?._id;


    if(!session) {
        router.push("/auth/login");
        return null;
    };


    if(!game) return null;


    if(isLoading) return <Loading/>;

    return(
        <>
            <div>
                <h1 className="text-xl font-semibold mb-4">Aktuelle Spieler in der Warteschlange:</h1>
                <ul className="flex flex-wrap gap-4">
                    
                </ul>
            </div>
            <div className="flex flex-col items-center justify-center h-full w-full">
                <h2 className="text-2xl font-bold mb-4">Spiel starten</h2>
                <BigRedBuzzer/>
            </div>
        </>
    );
}