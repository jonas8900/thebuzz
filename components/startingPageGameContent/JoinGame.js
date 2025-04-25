// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ErrorMessage from "../Toast/ErrorMessage";
// import SuccessMessage from "../Toast/SuccessMessage";
// import useSWR from "swr";

// export default function JoinGame({ joingameModal, setJoingameModal, setYourgameModal }) {
//       const { data, isLoading, mutate} = useSWR("/api/game/getGamesAsPlayer");
//       const [linkinput, setLinkInput] = useState("");
//       const [toastMessage, setToastMessage] = useState("");
//       const [showError, setShowError] = useState(false);
//       const [showSuccess, setShowSuccess] = useState(false);
//       const overlayJoinRef = useRef(null);

//        useEffect(() => {
//           document.addEventListener("mousedown", handleClickOutside);
      
//           return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//           };
//         }, []);
      

//       function handleClickOutside(e) {
//         if (
//             overlayJoinRef.current &&
//           !overlayJoinRef.current.contains(e.target)
//         ) {
//             setJoingameModal(false);
//         }
//       }


//       async function handleJoinGame(e) {
//         e.preventDefault();

//         const formData = new FormData(e.target);
//         const Data = Object.fromEntries(formData.entries());  

//         const gameLink = formData.get("link");
//         if(gameLink) {
//           const safeLinkRegex = /^(https?:\/\/)[^\s<>"]+$/;

//           if(!safeLinkRegex.test(gameLink)) {
//             setShowError(true);
//             setToastMessage("Dieser Link ist kein Link!");
//             setTimeout(() => {
//               setShowError(false);
//               setToastMessage("");
//             }, 5000);
//             return;
//           }
//         }

//         const response = await fetch("/api/game/join/joinGameAsPlayer", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ gameLink }),
//         });

//         if(!response.ok) {
//             setShowError(true);
//             setToastMessage("Etwas ist schiefgelaufen!");
//             setTimeout(() => {
//               setShowError(false);
//               setToastMessage("");
//             }, 3000);
//             return;
//           }

//         if (response.ok) {
//             setShowSuccess(true);
//             setToastMessage("Spiel beigetreten! 🎉");
//             setTimeout(() => {
//               setJoingameModal(false);
//               setYourgameModal(true);
//               mutate("/api/game/getGamesAsPlayer");
//               setShowSuccess(false);
//               setToastMessage("");
//             }, 3000);
//           }


//       }


//     return (
//         <>


//         <AnimatePresence>
//         {joingameModal && (
//              <motion.div
//              initial={{ opacity: 0 }}
//              animate={{ opacity: 1 }}
//              exit={{ opacity: 0 }}
//              transition={{ duration: 0.3 }}
//              className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full  backdrop-blur-md">
//                     <div
//                           class="mt-7 bg-white min-w-sm rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700"
//                           ref={overlayJoinRef}>
//                           <div class="p-4 sm:p-7">
//                             <div class="text-center">
//                               <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">
//                                 Trete dem Spiel bei
//                               </h1>
//                               <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
//                                 Keinen inviteLink? Sprich den Admin an!
//                               </p>
//                             </div>
//                             <form onSubmit={handleJoinGame}>
//                                 <div className="relative w-full mt-5">
//                                     <input
//                                     type="text"
//                                     id="link"
//                                     name="link"
//                                     required
//                                     placeholder=" "
//                                     value={linkinput}
//                                     onChange={(e) => setLinkInput(e.target.value)}
//                                     className="peer p-2 pt-4 w-full border border-black bg-gray-100 text-black dark:bg-gray-900 dark:border-white dark:text-white placeholder-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
//                                     />
//                                     <label
//                                         id="link"
//                                         className={`absolute left-2 text-sm text-gray-500 dark:text-gray-400 transition-all 
//                                             ${linkinput ? 'top-[-8px] bg-gray-900 pr-2 pl-2 text-xs' : 'top-1/2 transform -translate-y-1/2'} 
//                                             peer-focus-shown:top-[-8px]
//                                             peer-placeholder-shown:text-sm 
//                                             peer-placeholder-shown:text-gray-500 
//                                             peer-focus:text-xs 
//                                             peer-focus:text-blue-500 
//                                             peer-focus:dark:text-blue-500`}
//                                     >
//                                     Einladungslink einfügen
//                                   </label>
//                                 </div>
//                                 <button
//                                 className="cursor-pointer mt-8 bg-purple-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
//                                 type="submit"
//                                 >
//                                 Spiel beitreten
//                                 </button>
//                         </form>
//                         <div class="mt-5">

//                         </div>
//                       </div>
//                     </div>
//               </motion.div>
//           )}
//           {showError && <ErrorMessage message={toastMessage} />}
//           {showSuccess && <SuccessMessage message={toastMessage} />}
//           </AnimatePresence>
//         </>
//     );
// }
