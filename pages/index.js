

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { motion } from "framer-motion";
import Navigation from "../components/Navigation";
import ChooseAdminOrPlayer from "../components/game/chooseAdminOrPlayer";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Panel from "../components/informationcard/Panel";


const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || "https://thebuzz-cfde756a15ca.herokuapp.com", {
  path: '/socket.io', 
  transports: ['websocket', 'polling'], 
});

export default function Home() {
  const { data: session, status } = useSession();
  const [timestamps, setTimestamps] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dynamicData, setDynamicData] = useState('');
  const router = useRouter();


  useEffect(() => {
    socket.on("receiveTimestamp", (timestamp) => {
      setTimestamps((prev) => [...prev, timestamp]);
    });


    return () => {
      socket.off("receiveTimestamp");
    };
  }, []);

  if (status === "loading") {
    return <h1>Lade...</h1>;
  }

  if (status === "unauthenticated") {
    router.push("/auth/login");
  }



  const handleSendTimestamp = () => {
    const timestamp = new Date().toLocaleTimeString();
    socket.emit("sendTimestamp", timestamp);
  };

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
          <Navigation session={session} setPanelOpen={setPanelOpen} panelOpen={panelOpen} setDynamicData={setDynamicData} dynamicData={dynamicData}/>
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.5 }}>
          <Panel panelOpen={panelOpen} session={session} setDynamicData={setDynamicData} dynamicData={dynamicData} setPanelOpen={setPanelOpen}/>
          <ChooseAdminOrPlayer />
          <div className="absolute bottom-1/4 transform -translate-y-1/2 left-1/2 transform -translate-x-1/2 text-center text-white">
          {/* <button 
            onClick={handleSendTimestamp} 
            className="p-2 bg-blue-500 text-white rounded-md shadow-lg "
          >
            Send Timestamp
          </button> */}
          <ul className="mt-0 text-white">
            {timestamps.map((timestamp, index) => (
              <li key={index}>Timestamp received: {timestamp}</li>
            ))}
          </ul>
        </div>
        </motion.div>
        
      </motion.main>
    </>
  );
}
