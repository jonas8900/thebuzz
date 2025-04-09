import { useEffect, useState } from "react";
import ErrorMessage from "../../Toast/ErrorMessage";
import SuccessMessage from "../../Toast/SuccessMessage";
import useSWR from "swr";

export default function InvitePlayer() {
    const { data, error, mutate } = useSWR("/api/game/getChosenGame");

    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [inviteLink, setInviteLink] = useState('');

    const game = data?.chosenGame;
    const gameId = data?.chosenGame?._id;

    useEffect(() => {
        if (game?.invitelink) {
          setInviteLink(game.invitelink);
        } else {
          setInviteLink("");
        }
      }, [game, data]);
    

    function handleSendInvite(e) {
        e.preventDefault();
        console.log('Invite sent!');
        alert('invite sent');
    }
    
    async function handleGenerateLink() {
        try {
          const response = await fetch(`/api/game/getGameLinkAndPlayers?id=${gameId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          const result = await response.json();
    
          if (!response.ok) {
            setShowError(true);
            setToastMessage(result.error || "Fehler beim Generieren des Einladungslinks.");
            setTimeout(() => setShowError(false), 3000);
            return;
          }
    
          setInviteLink(result.invitelink); 
          mutate("/api/game/getChosenGame"); 
          setShowSuccess(true);
          setToastMessage("Einladungslink erfolgreich generiert!");
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
          setShowError(true);
          setToastMessage("Ein Fehler ist aufgetreten.");
          setTimeout(() => setShowError(false), 3000);
        }
      }


      async function handleCopyLink() {
        try {
          await navigator.clipboard.writeText(inviteLink);
          setShowSuccess(true);
          setToastMessage("Einladungslink erfolgreich kopiert!");
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
          setShowError(true);
          setToastMessage("Fehler beim Kopieren");
          setTimeout(() => setShowError(false), 3000);
        }
      }

    return(
   
              <>
          
                {showError && <ErrorMessage message={toastMessage} />}
                {showSuccess && <SuccessMessage message={toastMessage} />}
    
                <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 pt-12 rounded-lg ">
                    <h1 className="text-2xl font-bold mb-4">Spieler Hinzufügen:</h1>
                    <p className="text-sm text-gray-500 pb-4 dark:text-gray-400">an die eingegebene Email-Adresse wird ein Einladungslink verschickt, damit der Spieler dem Spiel beitreten kann.</p>
                    <form className="flex flex-col space-y-4" onSubmit={handleSendInvite}>
                    <div className="relative w-full h-12">
                        <input
                            type="email"
                            id="playerEmail"
                            name="playerEmail"
                            required
                            placeholder=" "
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <label
                        htmlFor="playerEmail"
                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all
                            ${emailInput ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                            peer-placeholder-shown:text-sm 
                            peer-placeholder-shown:text-gray-500 
                            peer-focus:text-xs 
                            peer-focus:text-blue-500 
                            peer-focus:dark:text-blue-500`}
                        >
                        Email-Adresse
                        </label>
                        </div>
                        <button type="submit" className="bg-blue-500 cursor-pointer text-white p-2 rounded">Spiel hinzufügen</button>
                    </form>
                    
                    <h2 className="text-2xl font-bold mb-4 mt-8">Einladungslink:</h2>
                    <p className="text-sm text-gray-500 pb-4 dark:text-gray-400">Hier ist der Einladungslink, den du an den Spieler senden kannst:</p>

                    <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg">
                        <input
                            type="text"
                            id="inviteLink"
                            name="inviteLink"
                            value={inviteLink || ""}
                            readOnly
                            className="w-full bg-gray-200 dark:bg-gray-800 text-black dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <button className="bg-blue-500 text-white p-2 rounded" onClick={handleGenerateLink}>Generieren</button>
                        <button className="bg-violet-500 text-white p-2 rounded" onClick={handleCopyLink}>Kopieren</button>
                    </div>
                    <div className="flex flex-col w-full h-full bg-gray-100 dark:bg-gray-900 p-4 rounded-lg  mt-4">
                    
                    <h2 className="text-2xl font-bold mb-4">Spieler des aktuelle Spieles:</h2>
                    <ul className="space-y-2">
                    {game?.players?.length > 0 ? (
                        game.players.map((player, index) => (
                            <li
                            key={index}
                            className="p-2 border rounded flex items-center justify-between mb-4"
                            >
                            <span>{player}</span>
                            </li>
                        ))
                        ) : (
                        <p>Keine Spieler vorhanden.</p>
                    )}
                    </ul>
                    </div>
                </div>
      
              </>
    );
}