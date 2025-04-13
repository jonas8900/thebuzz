

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import Navigation from "../components/Navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Panel from "../components/Panel/Panel";
import Loading from "../components/Status/Loading";
import JoinGame from "../components/startingPageGameContent/JoinGame";
import ShowYourGame from "../components/startingPageGameContent/ShowYourGames";
import useSWR from "swr";
import GamePanel from "../components/Panel/GamePanel";
import ErrorMessage from "../components/Toast/ErrorMessage";
import SuccessMessage from "../components/Toast/SuccessMessage";




export default function Game() {
  const router = useRouter();
  const { isReady, query } = router;
  const { x: queryId } = query;
  const { data: session, status } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  let amIAdmin = false;
  const { data: gameByID, mutate, isLoading } = useSWR(
    isReady && queryId ? `/api/gamemechanic/getGameById?x=${queryId}` : null
  );




  useEffect(() => {
    if (session && session.user.gameId !== queryId && session.user.isGuest) {
      signOut({ redirect: false });
    }
  }, [session, queryId]);




  if(!gameByID) {
    return <h1 className="absolute top-1/2 right-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800 dark:text-white">Spiel wurde nicht gefunden! Link ist eventuell ungültig</h1>;
  }

  if (session && gameByID) {
    amIAdmin = session?.user?.id === gameByID?.admin;
  } else {
    amIAdmin = false;
  }


  if (isLoading) return <Loading />;


  async function handleJoinGame(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());


    if(!userData.Username || userData.Username.length < 3) {
      setShowError(true);
      setToastMessage("Bitte gib einen Benutzernamen ein der mindestens 3 Zeichen hat!");
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 3000);
      return;
    }

    const localstorageGameId = localStorage.getItem("gameId");
    const localstorageUsername = localStorage.getItem("username");
     

    if (localstorageGameId && localstorageUsername) {

      if (localstorageGameId === gameByID._id && localstorageUsername === userData.Username) {
        signIn("guest", {
          username: userData.Username,
          gameId: gameByID._id,
          redirect: false,
        });

        return;
      }
    }


    const response = await fetch("/api/temporaryuser/addTemporaryUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: userData.Username, gameId: gameByID._id }),
    });
    
    if (response.ok) {
      await signIn("guest", {
        username: userData.Username,
        gameId: gameByID._id,
        redirect: false,
      });

      localStorage.setItem("gameId", gameByID._id);
      localStorage.setItem("username", userData.Username);
  
      setShowSuccess(true);
      setToastMessage("Spiel beigetreten und eingeloggt! 🎉");
      setTimeout(() => {
        mutate();
        setShowSuccess(false);
        setToastMessage("");
      }, 3000);
    } else {
      setShowError(true);
      setToastMessage("Etwas ist schiefgelaufen!");
      setTimeout(() => {
        setShowError(false);
        setToastMessage("");
      }, 3000);
    }
  }

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  };

  return (
    <>
      <motion.main
        className="bg-[url(/images/images.webp)] bg-contain bg-center bg-no-repeat h-screen w-full flex flex-col justify-center items-center relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.5 }}>
         <>
          {session ? (
            <>
                <GamePanel session={session} setPanelOpen={setPanelOpen} panelOpen={panelOpen} />
            </>
          ) : 
          (
            <>
            <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full  backdrop-blur-md">
                    <div
                          class="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700"
                        >
                          <div class="p-4 sm:p-7">
                            <div class="text-center">
                              <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">
                                Trete dem Spiel bei
                              </h1>
                              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Gib deinen Benutzernamen ein um dem Spiel zu joinen
                              </p>
                            </div>
                            <form onSubmit={handleJoinGame}>
                                <div className="relative w-full mt-5">
                                    <input
                                    type="text"
                                    id="Username"
                                    name="Username"
                                    required
                                    placeholder=" "
                                    value={usernameInput}
                                    onChange={(e) => setUsernameInput(e.target.value)}
                                    className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    />
                                    <label
                                        id="Username"
                                        className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
                                            ${usernameInput ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                            peer-focus-shown:top-[-8px]
                                            peer-placeholder-shown:text-sm 
                                            peer-placeholder-shown:text-gray-500 
                                            peer-focus:text-xs 
                                            peer-focus:text-blue-500 
                                            peer-focus:dark:text-blue-500`}
                                    >
                                    Benutzername
                                  </label>
                                </div>
                                <button
                                className="cursor-pointer mt-8 bg-purple-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
                                type="submit"
                                >
                                Spiel beitreten
                                </button>
                        </form>
                        <div class="mt-5">

                        </div>
                      </div>
                    </div>
              </motion.div>
   
            </>
          )}
          </>
          
        
          <div className="absolute bottom-1/4 transform -translate-y-1/2 left-1/2 transform -translate-x-1/2 text-center text-white">
        </div>
        </motion.div>
        
      </motion.main>

      {showError && <ErrorMessage message={toastMessage} />}
      {showSuccess && <SuccessMessage message={toastMessage} />}
    </>
  );
}
