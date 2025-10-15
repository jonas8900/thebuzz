// components/marketing/statspanel.jsx
import useSWR from "swr";
import { motion } from "framer-motion";
import StatBadge from "./startbadge";

export default function StatsPanel() {
  const { data, error, isLoading } = useSWR("/api/stats");
  const ok = data?.ok;
  const totals = data?.data?.totals;
  const last7d = data?.data?.last7d;

  // Skeletons
  const placeholders = Array.from({ length: 5 }, () => ({ kpi: 0, label: "Lade…" }));

  return (
    <section className="mx-auto max-w-6xl">
      {/* Section-Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">TheBuzz in Zahlen</h2>
          <p className="text-sm opacity-75">Live aus der Datenbank · aktualisiert beim Seitenaufruf</p>
           <p className="text-sm opacity-75">Die Statistiken sind aus den letzten 7 Tagen</p>
        </div>
        <div className="hidden sm:flex gap-2 text-xs opacity-70">
          <span className="rounded-full bg-emerald-500/12 px-2 py-[2px] text-emerald-700 dark:text-emerald-300">▲ positiv</span>
          <span className="rounded-full bg-rose-500/12 px-2 py-[2px] text-rose-700 dark:text-rose-300">▼ negativ</span>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {(error || !ok || !totals || isLoading ? placeholders : [
          {
            kpi: totals.admins,
            label: "angemeldete Admins",
            delta: last7d?.admins ?? 0,
            sublabel: "in den letzten 7 Tagen",
            icon: "🛠️",
          },
          {
            kpi: totals.tempUsers,
            label: "Teilnehmer (Mitspieler)",
            delta: last7d?.tempUsers ?? 0,
            sublabel: "neu beigetreten",
            icon: "👥",
          },
          {
            kpi: totals.tasks,
            label: "gespeicherte Fragen/Aufgaben",
            delta: last7d?.tasks ?? 0,
            sublabel: "neu erstellt",
            icon: "❓",
          },
          {
            kpi: totals.games,
            label: "angelegte Spiele",
            delta: last7d?.games ?? 0,
            sublabel: "neu angelegt",
            icon: "🎮",
          },
          {
            kpi: totals.playedGames,
            label: "fertig gespielte Spiele",
            delta: undefined, 
            sublabel: "gesamt",
            icon: "🏁",
          },
        ]).map((item, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          >
            <StatBadge
              kpi={item.kpi}
              label={item.label}
              sublabel={item.sublabel}
              delta={item.delta}
              icon={item.icon}
              loading={isLoading || !ok || !totals}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
