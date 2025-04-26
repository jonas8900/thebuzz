
import useSWR from "swr";
import { useSession } from "next-auth/react";
import Loading from "../../Status/Loading";

export default function ShowPlayers() {
    const { data, error, mutate, isLoading } = useSWR("/api/game/getChosenGame");
    const { data: session, status } = useSession();
    
    const game = data?.chosenGame;

    if(isLoading) return <Loading/>;


    return(
   
              <>
                <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 pt-12 rounded-lg ">
                    <h1 className="text-2xl font-bold mb-4">Aktuelle Spieler</h1>
 
                    {game?.players?.length > 0 ? (
                        <ul className="space-y-4">
                            {game.players.map((player) => (
                                <li key={player._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                    <div className="flex items-center">
                                        <span className="text-lg font-semibold">{player.username}</span>
                                    </div>
                                    {player?.points && (
                                        <span className="text-gray-500">{player.points} Punkte</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Keine Spieler gefunden.</p>
                    )}
                
                </div>
              </>
    );
}