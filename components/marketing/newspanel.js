import { useState } from "react";
import { motion } from "framer-motion";

const fade = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function NewsPanel({ items = [] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 3);

  return (
    <section id="news" className="mx-auto max-w-6xl px-4 pt-40 pb-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fade}
        className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-sm"
      >
        {/* Panel-Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">News & Updates</h2>
            <p className="text-sm opacity-75">Was sich zuletzt bei TheBuzz getan hat</p>
          </div>
          <span className="text-xs rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-600 text-white px-2 py-1">
            Changelog
          </span>
        </div>

        {/* Liste */}
        <div className="px-6 pb-5">
          <ul className="relative">
            {/* Vertikale Linie (optional, sehr subtil) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-2 top-0 h-full w-px bg-gradient-to-b from-fuchsia-400/40 via-blue-400/30 to-transparent"
            />

            {visible.map((u, i) => (
              <li key={i} className="relative pl-6 py-4 border-t first:border-t-0 border-white/50 dark:border-white/10">
                {/* Dot */}
                <span className="absolute left-0 top-5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-600 shadow" />


                <div className="grid gap-2 sm:grid-cols-[8rem,1fr] sm:items-start">
                 

                  <div>
                    {/* Titelzeile */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium tabular-nums opacity-70 sm:pt-1">
                            {u.date}
                        </span>
                        <span className="text-sm font-semibold">{u.title}</span>
                        {u.tag && (
                            <span
                            className={`text-[11px] px-2 py-[2px] rounded-full ${
                                u.tag === "Neu"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                : u.tag === "Fix"
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                                : "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                            }`}
                            >
                            {u.tag}
                            </span>
                        )}
                    </div>

                    {/* Details direkt unter dem Titel, gleiche Startkante */}
                    {u.desc && (
                      <p className="mt-4 text-sm sm:text-left leading-relaxed opacity-85">
                        {u.desc}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Toggle */}
          {items.length > 3 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAll(v => !v)}
                className="text-sm font-semibold px-3 py-1.5 rounded-md border border-white/60 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                {showAll ? "Weniger anzeigen" : "Alle anzeigen"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
