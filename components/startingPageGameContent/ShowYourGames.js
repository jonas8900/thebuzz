// import { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import useSWR from "swr";
// import ErrorMessage from "../Toast/ErrorMessage";
// import SuccessMessage from "../Toast/SuccessMessage";

// export default function ShowYourGame({ setYourgameModal, yourgameModal }) {
//     const { data, isLoading, mutate} = useSWR("/api/game/getGamesAsPlayer");
//     const [toastMessage, setToastMessage] = useState("");
//     const [showError, setShowError] = useState(false);
//     const [showSuccess, setShowSuccess] = useState(false);
    
//     const [linkinput, setLinkInput] = useState("");
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
//           setYourgameModal(false);
//         }
//       }

//     async function handleJoinActiveGame(gameId) {

//       const response = await fetch("/api/game/joinActiveGameAsPlayer", {
//           method: "POST",
//           headers: {
//               "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ gameId }),
//       });

      

//     }

        



//     return (
//         <>
//         <AnimatePresence>
//         {yourgameModal && (
//              <motion.div
//              initial={{ opacity: 0 }}
//              animate={{ opacity: 1 }}
//              exit={{ opacity: 0 }}
//              transition={{ duration: 0.3 }}
//              className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center bg-transparent rounded-lg shadow-lg overflow-hidden mx-auto h-screen w-full  backdrop-blur-md">
//                     <div
//                           class="mt-7 bg-white lg:min-w-lg rounded-xl shadow-lg dark:bg-gray-900 dark:border-gray-700"
//                           ref={overlayJoinRef}>
//                           <div class="p-4 sm:p-7">
//                             <div class="text-center">
//                               <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">
//                                 Deine Spiele
//                               </h1>
                            
//                             </div>
//                             <div>
//                             <div className="flex flex-col w-full h-full  p-4 rounded-lg  mt-4">
//                               <h2 className="text-2xl font-bold mb-4">Deine bisherigen Spiele:</h2>
//                               <ul className="space-y-2">
//                                   {data && (
//                                       <div>
//                                       {Array.isArray(data) && data.length > 0 ? (
//                                           data.map((game) => (
//                                           <li key={game._id} className="p-2 border rounded flex items-center justify-between mb-4">
//                                               <span>{game.name}</span>

//                                               <div className="space-x-2">
//                                               <button
//                                                   onClick={() => handleJoinActiveGame(game._id)}  
//                                                   className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded hover:bg-blue-600 active:bg-blue-900 transition duration-200"
//                                               >
//                                                   Beitreten
//                                               </button>
//                                               </div>
//                                           </li>
//                                           ))
//                                       ) : (
//                                           <p>Keine Spiele vorhanden.</p>
//                                       )}
//                                       </div>
//                                   )}
//                                 </ul>
//                             </div>

//                         {/* <button
//                         className="cursor-pointer mt-8 bg-purple-700 text-white font-bold py-2 px-4 w-full rounded hover:bg-purple-500 transition-all duration-200"
//                         >
//                         Spiel beitreten
//                         </button> */}
//                         <div class="mt-5">

//                         </div>
//                       </div>
//                     </div>
//                     </div>
//               </motion.div>
              
//           )}
//           </AnimatePresence>
//             {showError && <ErrorMessage message={toastMessage} />}
//             {showSuccess && <SuccessMessage message={toastMessage} />}
          
//         </>
//     );
// }
