import Image from "next/image";
import SwitchingThemes from "./theme/switchThemes";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";


export default function Navigation({session, setPanelOpen, panelOpen, dynamicData, setDynamicData, setCreateGameOpen, createGameOpen, statisticsOpen, setStatisticsOpen}) {
    const [fullscreen, setFullScreen] = useState(true);
    const [contentVisible, setContentVisible] = useState(true);
    const [addNewGameOpen, setAddNewGameOpen] = useState(false);

    const sidebarVariants = {
        open: { 
            width: '16rem', 
            opacity: 1, 
            transition: { duration: 0.5 }
        },
        closed: { 
            width: '0rem', 
            opacity: 0, 
            transition: { 
                duration: 0.5, 
                delay: 0.2 
            }
        }
    };

    function handleSignOut() {
        signOut(
            { callbackUrl: '/auth/login' }
        );
    }
    

    function handleAnimationComplete(definition) {
        if (definition === "open") {
            setContentVisible(true); 
        } else {
            setContentVisible(false); 
        }
    }

    function handleOpenPanel(data){
        if(panelOpen && dynamicData == data) {
            setPanelOpen(false);
            setDynamicData('');
        } else {
            setDynamicData(data);
            setPanelOpen(true);
        }
    }

    function handleOpenAdminPanel() {
        setPanelOpen(true);
        setDynamicData('admin');
        setCreateGameOpen(true);
    }

    function handleOpenStatisticsPanel() {
        setPanelOpen(true);
        setDynamicData('admin');
        setStatisticsOpen(true);
    }


    return(
        <>
            <AnimatePresence>
                {fullscreen && (
                    <motion.aside 
                        className="flex flex-col h-screen overflow-hidden bg-white border-r absolute top-0 left-0 dark:bg-gray-900 dark:border-gray-700 "
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        onAnimationComplete={(definition) => handleAnimationComplete(definition)}
                    >

                        {contentVisible && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-5 py-8"
                            >
                                <div className="flex items-center justify-between">
                                    <h1 className="py-2 font-bold text-gray-900 text-xl dark:text-gray-400">Menü</h1>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer" onClick={() => setFullScreen(false)}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                    </svg>
                                </div>
                                {session && (
                                    <div className="flex items-center mt-4 mb-2 space-x-4">
                                        <div className="flex flex-col">
                                            <h2 className="text-gray-900 font-semibold dark:text-violet-100">Hey {session.user.username}</h2>
                                        </div>
                                    </div>
                                )}

                                <hr className="h-px  bg-gray-900 border-0 dark:bg-white" />

                                <div className="flex flex-col justify-between flex-1 mt-6">
                                    <nav className="-mx-3 space-y-6 ">
                                        <div className="space-y-3">
                                            <label className="px-3 font-semibold text-sm text-gray-800 uppercase dark:text-gray-400">Spiel</label>
                           
                                            <button class="flex items-center px-3 py-2 w-full cursor-pointer text-gray-600 mt-3 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" onClick={() => handleOpenAdminPanel()}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>



                                                <span class="mx-2 text-m font-medium">Neues Spiel anlegen</span>
                                            </button>


                                            <button class="flex items-center px-3 py-2 text-gray-600 transition-colors w-full cursor-pointer duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" onClick={() => handleOpenPanel('admin')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                            </svg>




                                                <span class="mx-2 text-m font-medium">Adminpanel</span>
                                            </button>
                                        </div>
                                        <div class="space-y-3 pt-6">
                                            <label class="px-3 font-semibold text-s text-gray-800 uppercase dark:text-gray-400">Statistik</label>

                                                <button class="flex items-center px-3 py-2 text-gray-600 mt-3 w-full cursor-pointer transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" onClick={() => handleOpenStatisticsPanel()}>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                                                </svg>


                                                    <span class="mx-2 text-m font-medium">Statistik anzeigen</span>
                                                </button>

                                            </div>

                                            <div class="space-y-3 pt-6">
                                                <label class="px-3 font-semibold text-s text-gray-800 uppercase dark:text-gray-400">Account</label>


                                                {session ? (
                                                <button class="flex items-center px-3 py-2 text-gray-600 w-full cursor-pointer transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" onClick={handleSignOut}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                   
                                                        <span class="mx-2 text-m font-medium">Logout</span>
                                                   
                                                </button>
                                                 ) : (
                                                <button class="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                    </svg>
                                                   
                                                        <span class="mx-2 text-m font-medium">Login</span>
                                                   
                                                </button>
                                                )}

                                            
                                            </div>

                                            <div class="space-y-3 pt-6">
                                                <label class="px-3 font-semibold text-s text-gray-800 uppercase dark:text-gray-400">Einstellungen</label>

                                                <a class="flex items-center px-3 py-2 text-gray-600 mt-3 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" href="#">
                                                    <SwitchingThemes />

                                                    
                                                </a>


                                                {/* <a class="flex items-center px-3 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700" href="#">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>

                                                    <span class="mx-2 text-m font-medium">Einstellungen</span>
                                                </a> */}
                                        </div>

                                    </nav>
                                </div>
                            </motion.div>
                        )}
                    </motion.aside>
                )}
            </AnimatePresence>

            {!fullscreen && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer absolute top-10 left-10" onClick={() => setFullScreen(true)}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
                </svg>
            )}
        </>
    )
}








