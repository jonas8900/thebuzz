import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Card from "./card";
import FaqItem from "./faqitem";
import StatBadge from "./startpanel";
import OccasionCard from "./occasioncard";
import { useState } from "react";
import NewsPanel from "./newspanel";
import { updates } from "@/lib/panelData";
import { hintData, stepbystepData } from "@/lib/websiteData";
import StatsPanel from "./startpanel";

const fade = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function InfoLanding() {
    const [openNavbar, setOpenNavbar] = useState(false);

    function badgeToneClasses(tone = "blue") {
        const map = {
            emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
            blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
            violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
            amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
            rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
            pink: "bg-pink-500/15 text-pink-700 dark:text-pink-300"
        };
        return map[tone] ?? map.blue;
    }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-50 text-slate-900  dark:from-[#0b0b13] dark:via-[#11142a] dark:to-[#1b0f2e] dark:text-slate-100">
        {/* Buy me a coffee */}
        <a
            href="https://ko-fi.com/rhaigo"
            target="_blank"
            rel="noreferrer"
            className="fixed top-3 right-3 z-50 rounded-lg bg-yellow-400/90 px-3 py-1.5 text-sm font-semibold hidden md:flex text-black shadow hover:bg-yellow-400 transition"
            aria-label="Buy me a coffee"
        >
            ☕ Buy me a coffee
        </a>


        {/* Tiny Nav */}
            <header className="sticky top-0 z-40 border-b border-white/40 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
                {/* Desktop */}
                <nav className="mx-auto hidden md:flex max-w-6xl items-center justify-between px-4 py-2">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                    <span className="inline-block h-3 w-3 rounded-full bg-fuchsia-500" />
                    <span>TheBuzz</span>
                    </Link>
                    <div className="flex items-center gap-4 text-sm">
                    <a href="#hero" className="hover:opacity-80">Startseite</a>
                    <a href="#stats" className="hover:opacity-80">Statistiken</a>
                    <a href="#faq" className="hover:opacity-80">FAQ</a>
                    <Link href="/auth/login" className="rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 active:bg-blue-900">
                        Anmelden
                    </Link>
                    </div>
                </nav>

                {/* Mobile: Kopfzeile */}
                <nav className="md:hidden mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
                    <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                    <span className="inline-block h-3 w-3 rounded-full bg-fuchsia-500" />
                    <span>TheBuzz</span>
                    </Link>

                    <button
                    onClick={() => setOpenNavbar(v => !v)}
                    aria-expanded={openNavbar}
                    aria-controls="mobile-nav-panel"
                    aria-label={openNavbar ? "Menü schließen" : "Menü öffnen"}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/10"
                    >
                    {openNavbar ? "✕" : (
                        <div className="flex flex-col gap-1.5">
                        <span className="block h-0.5 w-5 bg-current" />
                        <span className="block h-0.5 w-5 bg-current" />
                        <span className="block h-0.5 w-5 bg-current" />
                        </div>
                    )}
                    </button>
                </nav>

                {/* Mobile: Menü unter der Navbar (nur Fade-In) */}
                <AnimatePresence initial={false}>
                    {openNavbar && (
                    <motion.div
                        id="mobile-nav-panel"
                        role="menu"
                        aria-label="Mobile Navigation"
                        className="md:hidden border-t border-white/40 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mx-auto max-w-6xl px-4 py-3">
                        <div className="grid gap-1.5 text-base">
                            <a href="#hero" onClick={() => setOpenNavbar(false)} className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                            Startseite
                            </a>
                            <a href="#stats" onClick={() => setOpenNavbar(false)} className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                            Statistiken
                            </a>
                            <a href="#faq" onClick={() => setOpenNavbar(false)} className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
                            FAQ
                            </a>
                            <Link
                                href="/auth/login"
                                onClick={() => setOpenNavbar(false)}
                                className="mt-3 mb-3 rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white hover:bg-blue-700 active:bg-blue-900"
                            >
                                Anmelden
                            </Link>
                            <Link
                                href="/auth/register"
                                onClick={() => setOpenNavbar(false)}
                                className="rounded-lg border border-blue-600 px-3 py-2 text-center font-semibold text-blue-700 hover:bg-blue-50 dark:hover:bg-white/10"
                            >
                                Kostenlos starten
                            </Link>
                            
                            <Link
                                href="https://ko-fi.com/rhaigo"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border bg-yellow-400/90 px-3 py-2 text-center font-semibold text-blue-700 hover:bg-blue-50 dark:hover:bg-yellow-400 transition"
                                aria-label="Buy me a coffee"
                            >
                                ☕ Buy me a coffee
                            </Link>
                        </div>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>
                </header>

        {/* Hero */}
        <section id="hero" className="relative">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={fade}
                className="mx-auto max-w-6xl px-4 py-16 sm:py-2"
            >
                <div className="text-center">
                <h1 className="text-4xl sm:text-5xl mt-20 mb-20 font-extrabold tracking-tight">
                    Interaktives Quiz mit{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-blue-600">
                    echtem Buzzer-Feeling
                    </span>
                </h1>
                <p className="mt-15 text-lg opacity-90">
                    Du möchtest mit Freunden oder der Familie einen schönen Abend haben und vielleicht ein bisschen Kompetetive ins Spiel bringen? Dann erstelle dein Spiel, lade Teilnehmende per Link ein – und los geht’s.
                    Live-Punkte, So viele Fragen wie du willst, so viele Spieler wie du willst, so viele Spiele wie du willst!
                </p>
               
                </div>

                <div className="relative mt-16 mb-16">
                    <div className="mx-auto h-[2px] w-48 rounded-full bg-gradient-to-r from-fuchsia-500 via-blue-500 to-sky-400" />
                    <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-blue-500/30 blur-2xl" />
                </div>


                <div className="text-center">


               <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                    {hintData.map((c, i) => (
                        <span
                        key={i}
                        className="group inline-flex items-center gap-2 rounded-full border border-white/60 dark:border-white/10
                                    bg-white/70 dark:bg-white/10 px-3.5 py-1.5 text-sm
                                    shadow-[0_1px_0_rgba(255,255,255,0.4)] dark:shadow-none
                                    hover:border-transparent hover:bg-gradient-to-r hover:from-fuchsia-500/15 hover:to-blue-600/15
                                    transition-colors"
                        role="listitem"
                        aria-label={c.label}
                        title={c.hint}
                        >
                        <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-600 ring-1 ring-white/40 dark:ring-white/10" />
                        <span className="font-medium">{c.label}</span>
                        <span className="sr-only">— {c.hint}</span>
                        </span>
                    ))}
                </div>



                <div className="mx-auto mt-16 max-w-3xl text-left">
                    <details className="group rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/5 p-5">
                        <summary className="flex cursor-pointer list-none items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Alle Schritte im Detail</h3>
                            <p className="text-sm opacity-70">Vom ersten Klick bis zum Start deiner Show</p>
                        </div>
                        <span
                            className="ml-4 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/70 dark:bg-white/10 transition-transform duration-200 group-open:rotate-45 group-open:bg-green-200 dark:group-open:bg-green-700"
                            aria-hidden="true"
                        >
                            
                        </span>
                        </summary>

                        <ol className="relative mt-5 space-y-4 pl-8">
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute left-4 top-0 h-full w-px bg-gradient-to-b from-fuchsia-400/40 via-blue-400/30 to-transparent"
                        />

                        {stepbystepData.map((s) => (
                            <li key={s.num} className="relative">
                            <span className="absolute -left-3 -top-3 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-blue-600 text-xs font-extrabold text-white shadow">
                                {s.num}
                            </span>

                            <div className="rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-4 py-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="font-semibold">{s.title}</h4>
                                {s.badge?.label && (
                                    <span className={`text-[11px] px-2 py-[2px] rounded-full ${badgeToneClasses(s.badge.tone)}`}>
                                    {s.badge.label}
                                    </span>
                                )}
                                </div>
                                <p className="mt-1 text-sm opacity-85 leading-relaxed">{s.desc}</p>
                            </div>
                            </li>
                        ))}
                        </ol>
                        <div className="mt-5 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/10 px-4 py-3 text-sm">
                        Tipp: In den Einstellungen kannst du Punktelogik, Zeitlimits und Buzzer-Countdowns an dein Event anpassen.
                        </div>
                    </details>
                </div>

                 <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    <Link
                    href="/auth/register"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 active:bg-blue-900"
                    >
                    Kostenlos starten
                    </Link>
                </div>


                <NewsPanel items={updates} />


                </div>
            </motion.div>
        </section>

        {/* Stats teaser */}
        <section id="stats" className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
            <StatsPanel/>
        </section>

        {/* What is it / For whom / Pricing / Limits */}
        <section id="about" className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
            <h2 className="text-2xl mt-0 mb-6 font-bold tracking-tight">Überblick</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                
            <Card title="Was ist TheBuzz?">
                <p>
                TheBuzz ist ein leichtes Live-Quiz-System mit Buzzer-Mechanik. Admins
                starten Runden, Teilnehmende treten via Link bei – ohne Account, nur mit einem Benutzernamen
                </p>
            </Card>
            <Card title="Für wen ist es?">
                <ul className="list-disc pl-5 space-y-1">
                <li>Event-Moderation & Teambuilding</li>
                <li>Unterricht & Trainings</li>
                <li>Hochzeiten, Geburtstage, Partys</li>
                <li>Streamer & Vereine</li>
                </ul>
            </Card>
            <Card title="Kostet es etwas?">
                <p>
                MVP-Phase: <strong>kostenlos</strong>. Wenn es dir gefällt, unterstütze
                mich gern über <em><Link href={"https://ko-fi.com/rhaigo"} target="_blank" className="underline">Buy me a coffee</Link></em>. 
                </p>
            </Card>
            <Card title="Hat es ein Spielerlimit?">
                <p>
                Für die MVP-Phase empfehle ich bis zu <strong>~50 Teilnehmende </strong>
                pro Spiel (abhängig von Netzwerk und Endgeräten). Größere Gruppen sind
                technisch möglich – Feedback willkommen!
                </p>
            </Card>
            </div>
        </section>

        {/* Occasions grid */}
        <section id="occasions" className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
            <h2 className="text-2xl font-bold tracking-tight">Wo kann man TheBuzz spielen?</h2>
            <p className="mt-2 opacity-80">Ein paar Anlässe, bei denen es richtig knallt – Bilder kannst du später einpflegen.</p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <OccasionCard title="Hochzeiten" note="Wer kennt das Brautpaar am besten?" href={"/images/wedding.jpg"} alt={"picture of a wineglas"}/>
            <OccasionCard title="Geburtstage & Partys" note="Schnelle Runden, hohe Energie." href={"/images/birthday.jpg"} alt={"picture of a birthdaycake"}/>
            <OccasionCard title="Teamevents" note="Icebreaker & Wissensduelle." href={"/images/teamevent.jpg"} alt={"Two women are sitting in the snow on chairs in front of a table with a laptop."}/>
            <OccasionCard title="Schule & Uni" note="Lernen mit Show-Moment."  href={"/images/school.jpg"} alt={"picture of a school libary"}/>
            </div>
        </section>

    

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
            <h2 className="text-2xl font-bold tracking-tight">FAQ</h2>
            <div className="mt-6 divide-y divide-white/40 dark:divide-white/10 rounded-xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5">
            <FaqItem q="Brauchen Spieler einen Account?">
                Nein. Spieler treten über einen Einladungslink bei und wählen nur einen Namen.
            </FaqItem>
            <FaqItem q="Welche Geräte werden unterstützt?">
                Moderne Browser auf Smartphone, Tablet und Desktop. Kein App-Download nötig.
            </FaqItem>
            <FaqItem q="Wie erstelle ich eine Runde?">
                Als Admin registrieren/anmelden, Spiel anlegen, Fragen hinzufügen, Link teilen – fertig.
            </FaqItem>
            <FaqItem q="Gibt es verschiedene Spielmodi?">
                Ja: Buzzer-Runden, Multiple-Choice, (geplant) Bilder-/Schnellraten und mehr.
            </FaqItem>
            <FaqItem q="Ist TheBuzz DSGVO-freundlich?">
                Spieleraccounts sind nicht nötig; wir speichern minimal erforderliche Daten für den Spielbetrieb. (Details siehe Datenschutz.)
            </FaqItem>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth/login" className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 active:bg-blue-900">
                Kostenlos starten
            </Link>
            <Link href="/auth/login" className="rounded-lg border border-blue-600 px-5 py-2.5 font-semibold text-blue-700 hover:bg-blue-50 dark:hover:bg-white/5">
                Als Admin anmelden
            </Link>
            </div>
        </section>


        <footer className="border-t border-white/50 dark:border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm opacity-80 flex flex-wrap items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} TheBuzz — Indie-Projekt</p>
            <div className="flex items-center gap-4">
                <Link href="/impressum" className="hover:opacity-80">Impressum</Link>
                <Link href="/privacy" className="hover:opacity-80">Datenschutz</Link>
                <Link href="/terms" className="hover:opacity-80">AGB</Link>
            </div>
            </div>
        </footer>
    </div>
  );
}

