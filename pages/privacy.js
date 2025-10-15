// pages/privacy.js
import Link from "next/link";

export default function Privacy() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-50 dark:from-[#0b0b13] dark:via-[#11142a] dark:to-[#1b0f2e] text-slate-900 dark:text-slate-100">
      {/* Hero */}
      <section className="border-b border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-600" />
              DSGVO-konform · EU-Hosting
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Datenschutzerklärung</h1>
            <p className="opacity-80">
              Stand: <span className="font-medium">[16.10.2025]</span>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
          {/* Main */}
          <article className="space-y-8">
            {/* Card 1 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="verantwortlicher" className="text-xl font-bold tracking-tight">1. Verantwortlicher</h2>
              <p className="mt-2 opacity-90">
                <strong>Jonas Maximilian Dally</strong><br />
                Am Fuhrenkampe 56<br />
                30419, Hannover, Deutschland
              </p>
              <p className="mt-2">
                E-Mail:{" "}
                <a className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="mailto:ankerquiz@gmail.com">
                  ankerquiz@gmail.com
                </a>
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="kurz" className="text-xl font-bold tracking-tight">2. Kurzüberblick</h2>
              <ul className="mt-3 space-y-2 text-sm opacity-90">
                <li>Verarbeitung nur für Betrieb, Sicherheit &amp; Support.</li>
                <li><strong>Hosting ausschließlich in der EU</strong>, kein Drittlandtransfer.</li>
                <li>Keine Weitergabe zu Werbezwecken, kein Profiling.</li>
                <li>Teilnehmende benötigen <strong>keinen Account</strong>.</li>
                <li>Admins registrieren sich mit E-Mail (oder OAuth, falls aktiviert).</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="datenarten" className="text-xl font-bold tracking-tight">3. Arten der verarbeiteten Daten</h2>

              <h3 className="mt-4 font-semibold">3.1 Admin-Accounts</h3>
              <ul className="mt-2 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Stammdaten: Name (optional), E-Mail</li>
                <li>Login: Passwort-Hash (kein Klartext) bzw. OAuth-Provider-ID</li>
                <li>Inhalte: Spiele, Fragen/Aufgaben, Einstellungen</li>
                <li>Nutzungs-/Protokolldaten: Zeitpunkte, Status, technische Logs</li>
              </ul>

              <h3 className="mt-4 font-semibold">3.2 Teilnehmende (ohne Account)</h3>
              <ul className="mt-2 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Anzeige-/Spielname (Pseudonym)</li>
                <li>Antworten, Punkte/Ranking, Spielzuordnung</li>
                <li>Session-Technik (z. B. Socket-IDs), minimale Stabilitäts-Logs</li>
              </ul>

              <h3 className="mt-4 font-semibold">3.3 Technische Daten (alle Nutzer)</h3>
              <ul className="mt-2 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Server-Logs: IP (ggf. gekürzt), Zeitstempel, Pfad, Statuscode</li>
                <li>Geräte-/Browserinformationen (User-Agent, nur technisch nötig)</li>
                <li>Cookies/LocalStorage (nur Session/Anti-Missbrauch)</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="zwecke" className="text-xl font-bold tracking-tight">4. Zwecke &amp; Rechtsgrundlagen</h2>
              <ul className="mt-3 space-y-2 text-sm opacity-90">
                <li><strong>Bereitstellung</strong> (Spielbetrieb) – Art. 6 Abs. 1 lit. b DSGVO (Admins) / lit. f (Teilnehmende).</li>
                <li><strong>Sicherheit &amp; Stabilität</strong> (Fehler-/Missbrauchsprävention) – Art. 6 Abs. 1 lit. f DSGVO.</li>
                <li><strong>Kommunikation/Support</strong> – Art. 6 Abs. 1 lit. b und lit. f DSGVO.</li>
                <li><strong>Rechtspflichten</strong> – Art. 6 Abs. 1 lit. c DSGVO.</li>
              </ul>
            </div>

            {/* Card 5 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="hosting" className="text-xl font-bold tracking-tight">5. Hosting &amp; Server-Logs (EU)</h2>
              <p className="mt-2 opacity-90">
                TheBuzz wird bei <strong>Heroku</strong> mit Rechenzentrumsstandort(en) in der EU betrieben.
                Es besteht ein <strong>Auftragsverarbeitungsvertrag (Art. 28 DSGVO)</strong>. Server-Logs (z. B. IP,
                Zeitstempel, URL, User-Agent) dienen der Betriebssicherheit und werden i. d. R. nach <strong>[7–30]</strong> Tagen
                gelöscht oder anonymisiert. Soweit möglich, speichern wir IPs gekürzt.
              </p>
            </div>

            {/* Card 6 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="cookies" className="text-xl font-bold tracking-tight">6. Cookies &amp; ähnliche Technologien</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Essenzielle Cookies/Storage (Session, CSRF, Socket, Rate-Limit) – Art. 6 Abs. 1 lit. b/f DSGVO.</li>
                <li>Kein Drittanbieter-Tracking/Marketing-Cookies.</li>
              </ul>
              <p className="mt-2 opacity-90">Ohne essenzielle Cookies ist Login/Spiel ggf. nicht nutzbar.</p>
            </div>

            {/* Card 7 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="registrierung" className="text-xl font-bold tracking-tight">7. Registrierung (Admins)</h2>
              <p className="mt-2 opacity-90">
                Für Admin-Konten verarbeiten wir E-Mail und Passwort-Hash  oder eine
                OAuth-ID. Löschung auf Wunsch möglich (siehe Rechte).
              </p>
            </div>

            {/* Card 8 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="teilnahme" className="text-xl font-bold tracking-tight">8. Teilnahme ohne Account</h2>
              <p className="mt-2 opacity-90">
                Teilnehmende treten per Einladungslink bei, wählen einen Anzeigenamen und spielen ohne Registrierung.
                Daten werden nur für die jeweilige Runde verarbeitet; nach Spielende erfolgt Löschung oder
                Pseudonymisierung/Aggregation für nicht-personenbezogene Statistiken.
              </p>
            </div>

            {/* Card 9 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="kommunikation" className="text-xl font-bold tracking-tight">9. Kommunikation &amp; Support</h2>
              <p className="mt-2 opacity-90">
                Bei Kontakt verarbeiten wir die angegebenen Daten zur Bearbeitung (Art. 6 Abs. 1 lit. b/f DSGVO). Die
                Aufbewahrung richtet sich nach gesetzlichen Vorgaben und Erforderlichkeit.
              </p>
            </div>

            {/* Card 10 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="aufbewahrung" className="text-xl font-bold tracking-tight">10. Aufbewahrung &amp; Löschung</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Account-Daten: bis zur Löschung bzw. nach gesetzlichen Fristen.</li>
                <li>Spiel-/Fragedaten (Admin): bis zur Löschung durch dich oder Projektende.</li>
                <li>Teilnahmedaten: bis zum Spielende; danach Löschung/Aggregation.</li>
                <li>Logs: i. d. R. <strong>[7–30]</strong> Tage.</li>
              </ul>
            </div>

            {/* Card 11 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="empfaenger" className="text-xl font-bold tracking-tight">11. Empfänger</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Hosting/Infrastruktur in der EU (Auftragsverarbeiter, Art. 28 DSGVO)</li>
                <li>E-Mail-/Zustelldienste (EU-basiert oder EU-Rechenzentrum)</li>
                <li>Behörden/Gerichte, sofern gesetzlich erforderlich</li>
              </ul>
              <p className="mt-2 opacity-90"><strong>Keine</strong> Weitergabe an Werbenetzwerke, <strong>kein</strong> Verkauf von Daten.</p>
            </div>

            {/* Card 12 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="drittland" className="text-xl font-bold tracking-tight">12. Drittlandtransfer</h2>
              <p className="mt-2 opacity-90">
                Es findet <strong>kein</strong> Transfer personenbezogener Daten in Drittländer außerhalb der EU/EWR statt.
                Ausnahmen nur nach Art. 44 ff. DSGVO (z. B. EU-Standardvertragsklauseln) und geeigneten Zusatzmaßnahmen.
              </p>
            </div>

            {/* Card 13 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="sicherheit" className="text-xl font-bold tracking-tight">13. Datensicherheit</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>HTTPS/TLS, aktuelle Cipher</li>
                <li>Passwort-Hashing, RBAC, Need-to-know</li>
                <li>Regelmäßige Updates &amp; Patches</li>
                <li>Protokollierung sicherheitsrelevanter Ereignisse</li>
                <li>AV-Verträge mit Dienstleistern</li>
              </ul>
            </div>

            {/* Card 14 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="rechte" className="text-xl font-bold tracking-tight">14. Deine Rechte</h2>
              <p className="mt-2 opacity-90">
                Rechte nach Art. 15–21 DSGVO: Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit,
                Widerspruch. Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO).
              </p>
              <p className="mt-2 opacity-90">
                Kontakt: siehe <a className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="#verantwortlicher">Verantwortlicher</a>.
              </p>
            </div>

            {/* Card 15 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="pflicht" className="text-xl font-bold tracking-tight">15. Pflicht zur Bereitstellung</h2>
              <p className="mt-2 opacity-90">
                Admins: E-Mail/Passwort (oder OAuth) erforderlich. Teilnehmende: Anzeigename nötig. Ohne diese Angaben
                ist die Nutzung nicht möglich.
              </p>
            </div>

            {/* Card 16 */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="aenderungen" className="text-xl font-bold tracking-tight">16. Änderungen</h2>
              <p className="mt-2 opacity-90">
                Wir passen diese Erklärung an, wenn sich Dienst, Rechtslage oder Verarbeitung ändern. Die aktuelle
                Version ist hier abrufbar; wesentliche Änderungen kommunizieren wir in der App.
              </p>
            </div>

            <div className="text-sm opacity-70">
              Hinweis: Diese Seite ist eine Vorlage und ersetzt keine Rechtsberatung. Bitte ergänze die konkret
              eingesetzten Anbieter und deren EU-Standorte sowie AV-Verträge.
            </div>

            <div className="mt-4">
              <Link className="text-sm underline decoration-dotted underline-offset-4 hover:opacity-80" href="/impressum">
                Zum Impressum
              </Link>
            </div>
          </article>

          {/* Aside / Inhaltsverzeichnis */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Inhalt</h3>
              <ul className="mt-3 space-y-2 text-sm opacity-90">
                <li><a className="hover:opacity-80" href="#verantwortlicher">1. Verantwortlicher</a></li>
                <li><a className="hover:opacity-80" href="#kurz">2. Kurzüberblick</a></li>
                <li><a className="hover:opacity-80" href="#datenarten">3. Datenarten</a></li>
                <li><a className="hover:opacity-80" href="#zwecke">4. Zwecke &amp; Grundlagen</a></li>
                <li><a className="hover:opacity-80" href="#hosting">5. Hosting/Logs</a></li>
                <li><a className="hover:opacity-80" href="#cookies">6. Cookies</a></li>
                <li><a className="hover:opacity-80" href="#registrierung">7. Registrierung</a></li>
                <li><a className="hover:opacity-80" href="#teilnahme">8. Teilnahme</a></li>
                <li><a className="hover:opacity-80" href="#kommunikation">9. Kommunikation</a></li>
                <li><a className="hover:opacity-80" href="#aufbewahrung">10. Aufbewahrung</a></li>
                <li><a className="hover:opacity-80" href="#empfaenger">11. Empfänger</a></li>
                <li><a className="hover:opacity-80" href="#drittland">12. Drittlandtransfer</a></li>
                <li><a className="hover:opacity-80" href="#sicherheit">13. Sicherheit</a></li>
                <li><a className="hover:opacity-80" href="#rechte">14. Rechte</a></li>
                <li><a className="hover:opacity-80" href="#pflicht">15. Pflicht</a></li>
                <li><a className="hover:opacity-80" href="#aenderungen">16. Änderungen</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
