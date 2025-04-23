import { useEffect, useState } from "react";
import { CircleX, Loader, Menu } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import AddQuestions from "../PanelPages/Questions/AddQuestion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AddGame from "../PanelPages/Game/AddGame";
import useSWR, { mutate } from "swr";
import ErrorMessage from "../Toast/ErrorMessage";
import SuccessMessage from "../Toast/SuccessMessage";
import ShowQuestions from "../PanelPages/Questions/ShowQuestion";
import InvitePlayer from "../PanelPages/Player/InvitePlayer";
import StartGame from "../PanelPages/Game/StartGame";
import Loading from "../Status/Loading";
import GameSettings from "../PanelPages/Game/GameSettings";


export default function Panel({panelOpen, dynamicData, setDynaicData, setPanelOpen, setCreateGameOpen, createGameOpen,}) {
    const { data, isLoading } = useSWR("/api/game/getGames");
    const { data: gameAsPlayer } = useSWR("/api/game/getGamesAsPlayer");
    
    const [activeSection, setActiveSection] = useState( {title: 'Fragen', subItem: 'Anlegen'} );
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const [toastMessage, setToastMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const menuItems = [
        { title: 'Fragen', subItems: ['Anlegen', 'Anzeigen'] },
        { title: 'Spieler', subItems: ['Anzeigen', 'Einladen'] },
        { title: 'Spiel', subItems: ['Starten', 'Erstellen', 'Einstellungen'] },
    ];


    useEffect(() => {
        if(createGameOpen) {
            console.log(createGameOpen)
            setPanelOpen(true);
            setActiveSection({ title: 'Spiel', subItem: 'Erstellen' });
            setCreateGameOpen(false);
        }

    }, [createGameOpen, setPanelOpen]);

    if(!session) {
        router.push("/auth/login");
        return null;
    } 

    if(!data) return null;

    if (isLoading) return <Loading/>
   

    async function handleChangeGame(selectedGameId) {
        const response = await fetch("/api/game/changeGame", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedGameId }),
        });
      
        const data = await response.json();
        console.log(data);
      
        if (!response.ok) {
          setShowError(true);
          setToastMessage("Etwas ist schiefgelaufen!");
          setTimeout(() => {
            setShowError(false);
            setToastMessage("");
          }, 3000);
          return;
        }
      
        setShowSuccess(true);
        setToastMessage("Spiel gewechselt, Ma boy! 🎉");
        mutate("/api/game/getChosenGame");
        setTimeout(() => {
          setShowSuccess(false);
          setToastMessage("");
        }, 3000);
    }
    
    return (
        <AnimatePresence>
            {panelOpen & dynamicData === "admin" && (
                  
                  <motion.div 
                    className="absolute top-1/2 left-1/2 lg:w-1/2 lg:h-3/4 w-full h-full flex border bg-gray-100 rounded-2xl shadow-xl transform -translate-x-1/2 -translate-y-1/2 overflow-hidden dark:bg-gray-900"
                    initial={{ opacity: 0, scale: 0.8, x: -300}}
                    animate={{ opacity: 1, scale: 1  , x: 0 }}
                    exit={{ opacity: 0, scale: 0.8  , x: -300 }}
                    transition={{ duration: 0.2 }}
                  >
                  <button
                      className="absolute top-4 right-4 lg:hidden z-50 p-2 bg-blue-500 text-white rounded-full"
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? (
                        <CircleX ></CircleX>
                        ) : (<Menu className="w-6 h-6" />)}

                  </button>
  
                  <div className={`fixed inset-0 bg-gray-800 bg-opacity-50 z-40 transition-all duration-300 ${isMenuOpen ? 'block' : 'hidden'} lg:block lg:relative lg:bg-transparent lg:bg-opacity-100`}>
                      <div className="w-3/4  lg:w-full h-full bg-gray-100 p-8 pt-12 flex flex-col border-r border-gray-300 dark:bg-gray-900 ">
                          {menuItems.map((item) => (
                              <div key={item.title} className="mb-5">
                                  <h2 className="font-bold mb-2 text-gray-900 dark:text-white">{item.title}</h2>
                                  <div className="flex flex-col space-y-1">
                                      {item.subItems.map((subItem) => (
                                          <button
                                              key={subItem}
                                              className={`p-2 pr-12 text-left rounded cursor-pointer ${
                                                activeSection.title === item.title && activeSection.subItem === subItem
                                                  ? 'bg-blue-500 text-white active:bg-blue-900 transition-all duration-200'
                                                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:hover:text-white'
                                              }`}
                                              onClick={() => {
                                                  setActiveSection({ title: item.title, subItem });
                                                  setIsMenuOpen(false); 
                                              }}
                                          >
                                              {subItem}
                                          </button>
                                      ))}
                                     
                                  </div>
                              </div>
                          ))}
                          <div className="absolute bottom-10 lg:w-9/10 w-1/2 left-0 p-4 pr-0 bg-gray-100 dark:bg-gray-900">
                            <h2>Aktuelles Spiel:</h2>
                            {Array.isArray(data) && data.length > 0 && (
                                <select 
                                    className="p-2 mt-2 border w-full rounded bg-gray-50 dark:bg-gray-800 text-black dark:text-white "
                                    onChange={(e) => handleChangeGame(e.target.value)}  
                                    >
                                        {data.map((game) => (
                                            <option key={game._id} value={game._id} className="p-2">
                                            {game.name}
                                            </option>
                                        ))}
                                </select>
                              )}
                            
                          </div>
                           <button 
                            className={`p-2 pr-12 text-left rounded cursor-pointer absolute top-0 left-0 `}>
                                 <CircleX className="hover:stroke-red-500 transition-colors duration-200"  onClick={() => setPanelOpen(false)} />
                            </button>
                      </div>
                  </div>
  

                  <div className="w-full lg:w-full h-full p-8  overflow-y-scroll ">
                    {activeSection.title === 'Fragen' && activeSection.subItem === 'Anlegen' && <AddQuestions/>}
                    {activeSection.title === 'Fragen' && activeSection.subItem === 'Anzeigen' && <ShowQuestions/>}

                    {activeSection.title === 'Spieler' && activeSection.subItem === 'Anzeigen' && <div>Spieler anzeigen Inhalt</div>}
                    {activeSection.title === 'Spieler' && activeSection.subItem === 'Einladen' && <InvitePlayer/>}

                    {activeSection.title === 'Spiel' && activeSection.subItem === 'Starten' && <StartGame/>}
                    {activeSection.title === 'Spiel' && activeSection.subItem === 'Erstellen' && <AddGame/>}
                    {activeSection.title === 'Spiel' && activeSection.subItem === 'Einstellungen' && <GameSettings/>}
                  </div>

              </motion.div>

            )}
            {panelOpen & dynamicData === 'statistic' && (
                <div className="flex flex-col items-center justify-center w-full h-full p-4">
                    <h1 className="text-2xl font-bold">Statistic Panel</h1>
                    <p className="mt-2 text-gray-600">Manage your application settings here.</p>
                </div>
            )}
                
            {showError && <ErrorMessage message={toastMessage} />}
            {showSuccess && <SuccessMessage message={toastMessage} />}
       </AnimatePresence>
    );
    }