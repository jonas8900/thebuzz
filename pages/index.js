

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import Navigation from "../components/Navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Panel from "../components/Panel/Panel";
import Loading from "../components/Status/Loading";
import JoinGame from "../components/startingPageGameContent/JoinGame";
import ShowYourGame from "../components/startingPageGameContent/ShowYourGames";
import useSWR from "swr";



export default function Home() {
  const { data: session, status } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [dynamicData, setDynamicData] = useState('');
  const [joingameModal, setJoingameModal] = useState(false);
  const [yourgameModal, setYourgameModal] = useState(false);
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const router = useRouter();



  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
  }

  if(session?.user?.isGuest) {
    router.push("/auth/login");
  }

  function handleOpenModal() {
    setPanelOpen(true);
    setDynamicData('admin');
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
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Navigation session={session} setPanelOpen={setPanelOpen} panelOpen={panelOpen} setDynamicData={setDynamicData} dynamicData={dynamicData} setCreateGameOpen={setCreateGameOpen} createGameOpen={createGameOpen}/>
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.5 }}>
          <Panel panelOpen={panelOpen} session={session} setDynamicData={setDynamicData} dynamicData={dynamicData} setPanelOpen={setPanelOpen} setCreateGameOpen={setCreateGameOpen} createGameOpen={createGameOpen} />
          <div className="flex flex-col items-center justify-center h-screen ">
            <h1 className="text-4xl font-bold mb-4">Spiel Joinen</h1>
            <p className="text-lg mb-8">Verwalte deine Spiele</p>
            <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-500 text-white cursor-pointer rounded hover:bg-blue-600 active:bg-blue-900 transition duration-200" onClick={handleOpenModal}>Spiele Verwalten</button>
            </div>
        </div>
        
          <div className="absolute bottom-1/4 transform -translate-y-1/2 left-1/2 transform -translate-x-1/2 text-center text-white">
        </div>
        </motion.div>
        
      </motion.main>

    </>
  );
}
