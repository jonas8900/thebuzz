import { useState } from "react";
import { motion } from "framer-motion";
import Navigation from "../components/Navigation";
import { useSession } from "next-auth/react";
import Panel from "../components/Panel/Panel";
import Loading from "../components/Status/Loading";
import Link from "next/link";
import InfoLanding from "@/components/marketing/landing";

export default function Home() {
  const { data: session, status } = useSession();
  const [panelOpen, setPanelOpen] = useState(false);
  const [dynamicData, setDynamicData] = useState("");
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [statisticsOpen, setStatisticsOpen] = useState(false);

  if (status === "loading") return <Loading />;



  const isAuthorized =
    status === "authenticated" && !session?.user?.isGuest;

  
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <>
    {isAuthorized ? (
        <motion.main
          className="bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-50 bg-contain bg-center bg-no-repeat h-screen w-full flex flex-col justify-center items-center relative overflow-hidden dark:from-[#0b0b13] dark:via-[#11142a] dark:to-[#1b0f2e]"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {/* Buy me a coffee auch hier verfügbar */}
          <a
            href="https://ko-fi.com/rhaigo"
            target="_blank"
            rel="noreferrer"
            className="fixed top-4 right-4 z-50 rounded-lg bg-yellow-400/90 px-3 py-1.5 text-sm font-semibold text-black shadow hover:bg-yellow-400 transition"
            aria-label="Buy me a coffee"
          >
            ☕ Buy me a coffee
          </a>

          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Navigation
              session={session}
              setPanelOpen={setPanelOpen}
              panelOpen={panelOpen}
              setDynamicData={setDynamicData}
              dynamicData={dynamicData}
              setCreateGameOpen={setCreateGameOpen}
              createGameOpen={createGameOpen}
              statisticsOpen={statisticsOpen}
              setStatisticsOpen={setStatisticsOpen}
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.3 }}
            className="w-full"
          >
            <Panel
              panelOpen={panelOpen}
              session={session}
              setDynamicData={setDynamicData}
              dynamicData={dynamicData}
              setPanelOpen={setPanelOpen}
              setCreateGameOpen={setCreateGameOpen}
              createGameOpen={createGameOpen}
              statisticsOpen={statisticsOpen}
              setStatisticsOpen={setStatisticsOpen}
            />

            <div className="flex flex-col items-center justify-center h-screen">
              <h1 className="text-4xl font-bold mb-4">Spiel Verwalten</h1>
              <div className="flex space-x-4">
                <button
                  className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded hover:bg-blue-700 active:bg-blue-900 transition"
                  onClick={() => {
                    setPanelOpen(true);
                    setDynamicData("admin");
                  }}
                >
                  Spiele Verwalten
                </button>
              </div>
            </div>
          </motion.div>
        </motion.main>
        ) : (
          <InfoLanding/>
        )}
    </>
  );
}
