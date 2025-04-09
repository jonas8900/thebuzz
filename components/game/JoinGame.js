import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinGame() {
    const [joingameModal, setJoingameModal] = useState(false);
    const [linkinput, setLinkInput] = useState("");
      const overlayJoinRef = useRef(null);

       useEffect(() => {
          document.addEventListener("mousedown", handleClickOutside);
      
          return () => {
            document.removeEventListener("mousedown", handleClickOutside);
          };
        }, []);
      



      function handleClickOutside(e) {
        if (
            overlayJoinRef.current &&
          !overlayJoinRef.current.contains(e.target)
        ) {
            setJoingameModal(false);
        }
      }


    return (
        <>
        <div className="flex flex-col items-center justify-center h-screen ">
            <h1 className="text-4xl font-bold mb-4">Spiel Joinen</h1>
            <p className="text-lg mb-8">Joine einem bereits bestehendem Spiel.</p>
            <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded hover:bg-blue-600 active:bg-blue-900 transition duration-200" onClick={() => setJoingameModal(!joingameModal)}>Spiel beitreten</button>
                <button className="px-4 py-2 bg-purple-800 text-white cursor-pointer rounded hover:bg-purple-600 active:bg-violet-500 transition duration-200">Deine Spiele</button>
            </div>
        </div>

        {joingameModal && (
             <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.3 }}
             className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full  backdrop-blur-md">
                    <div
                          class="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700"
                          ref={overlayJoinRef}>
                          <div class="p-4 sm:p-7">
                            <div class="text-center">
                              <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">
                                Trete dem Spiel bei
                              </h1>
                              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Keinen inviteLink? Sprich den Admin an!
                              </p>
                            </div>
                            <div className="relative w-full mt-5">
                                <input
                                type="text"
                                id="question"
                                name="question"
                                required
                                placeholder=" "
                                value={linkinput}
                                onChange={(e) => setLinkInput(e.target.value)}
                                className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                                <label
                                    htmlFor="question"
                                    className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
                                        ${linkinput ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
                                        peer-focus-shown:top-[-8px]
                                        peer-placeholder-shown:text-sm 
                                        peer-placeholder-shown:text-gray-500 
                                        peer-focus:text-xs 
                                        peer-focus:text-blue-500 
                                        peer-focus:dark:text-blue-500`}
                                >
                                Einladungslink einfügen
                                </label>
                            </div>
                            <button
                            className="cursor-pointer mt-8 bg-purple-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
                            >
                            Spiel beitreten
                            </button>
                            <div class="mt-5">

                            </div>
                          </div>
                        </div>
                    </motion.div>
                )}
        </>
    );
}
