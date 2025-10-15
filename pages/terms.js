// pages/terms.js
import Link from "next/link";

export default function Terms() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-50 dark:from-[#0b0b13] dark:via-[#11142a] dark:to-[#1b0f2e] text-slate-900 dark:text-slate-100">
      {/* Hero */}
      <section className="border-b border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-600" />
              Nutzungsbedingungen · EU-Hosting
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Nutzungs&shy;bedingungen (AGB)</h1>
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
            {/* 1. Anbieter & Geltungsbereich */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="anbieter" className="text-xl font-bold tracking-tight">1. Anbieter &amp; Geltungsbereich</h2>
              <p className="mt-2 opacity-90">
                Diese Nutzungsbedingungen gelten für die Nutzung der Plattform <strong>TheBuzz</strong> (nachfolgend
                „Dienst“), bereitgestellt durch:
              </p>
              <p className="mt-2 opacity-90">
                <strong>Jonas Maximilian Dally</strong><br />
                Am Fuhrenkampe 56, 30419, Hannover, Deutschland<br />
                E-Mail: <a className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="mailto:ankerquiz@gmail.com">ankerquiz@gmail.com</a>
              </p>
              <p className="mt-2 opacity-90">
                Mit der Nutzung des Dienstes erklärst du dich mit diesen Bedingungen einverstanden.
              </p>
            </div>

            {/* 2. Unentgeltlichkeit */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="preis" className="text-xl font-bold tracking-tight">2. Nutzung ist unentgeltlich</h2>
              <p className="mt-2 opacity-90">
                Die Nutzung von TheBuzz ist derzeit <strong>kostenlos</strong>. Es bestehen keine Zahlungsverpflichtungen.
                Freiwillige Unterstützungen (z. B. via Ko-fi) sind unabhängig vom Nutzungsverhältnis und haben keinen Einfluss auf
                Funktionen oder Supportansprüche. Wir behalten uns vor, zukünftig optionale, gesondert gekennzeichnete Premium-Funktionen
                anzubieten.
              </p>
            </div>

            {/* 3. Konten & Teilnahme */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="konten" className="text-xl font-bold tracking-tight">3. Admin-Konten &amp; Teilnahme ohne Account</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Admins registrieren sich mit E-Mail (oder OAuth, falls aktiviert) und verwalten Spiele/Fragen.</li>
                <li>Teilnehmende treten über Einladungslink bei und wählen einen Anzeigenamen – <strong>ohne Account</strong>.</li>
                <li>Admins sind für Inhalte ihrer Spiele verantwortlich (Fragen, Medien, Namen der Teilnehmenden).</li>
              </ul>
            </div>

            {/* 4. Datenhaltung (EU) */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="daten" className="text-xl font-bold tracking-tight">4. Datenhaltung &amp; Speicherorte (EU)</h2>
              <p className="mt-2 opacity-90">
                Wir betreiben TheBuzz auf Servern innerhalb der Europäischen Union. Struktur:
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>
                  <strong>Anwendungsdaten (z. B. Admin-Konten, Spiele, Fragen, Antworten, Punkte):</strong> Speicherung in einer
                  <strong> MongoDB-Datenbank</strong> auf einem EU-Server.
                </li>
                <li>
                  <strong>Bilder für Bildfragen:</strong> Speicherung auf einem <strong>S3-kompatiblen Objekt-Speicher</strong>
                  mit öffentlichen, nicht authentifizierten URLs („<em>public but unlisted</em>“). Siehe Abschnitt 5.
                </li>
              </ul>
              <p className="mt-2 text-sm opacity-80">
                Details zur Verarbeitung findest du in der{" "}
                <Link className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="/privacy">
                  Datenschutzerklärung
                </Link>.
              </p>
            </div>

            {/* 5. Wichtiger Hinweis zu Bild-Uploads */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="bilder" className="text-xl font-bold tracking-tight">5. Wichtiger Hinweis zu Bild-Uploads (S3-URLs)</h2>
              <div className="rounded-xl border border-amber-400/40 bg-amber-50/60 dark:bg-amber-400/10 p-4 text-sm">
                <p className="opacity-90">
                  <strong>Transparenz:</strong> Bilder, die du für Bildfragen hochlädst, werden auf einem S3-Speicher mit
                  <strong> ungeschützter (nicht authentifizierter) Direkt-URL</strong> abgelegt. Diese URLs sind nicht gelistet
                  (schwer zu erraten), jedoch gilt:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>
                    <strong>Kein Login-Schutz:</strong> Wer die exakte URL kennt, kann das Bild aufrufen und herunterladen.
                  </li>
                  <li>
                    <strong>Bitte keine sensiblen Inhalte hochladen</strong> (z. B. Ausweise, Gesundheitsdaten, intime Fotos,
                    personenbezogene Daten Dritter ohne Einwilligung).
                  </li>
                  <li>
                    Du bestätigst, dass du die <strong>Nutzungsrechte</strong> an hochgeladenen Bildern besitzt und dass die Inhalte
                    rechtmäßig sind.
                  </li>
                </ul>
                <p className="mt-2 opacity-90">
                  Möchtest du, dass Bilder nur mit Login/Token zugänglich sind, lade derzeit bitte <strong>keine sensiblen Medien</strong> hoch.
                  Eine nachträgliche Absicherung (Presigned URLs, Access Policies) ist technisch möglich, aber aktuell nicht umgesetzt.
                </p>
              </div>
              <p className="mt-3 text-sm opacity-80">
                Auf Wunsch können Admins ihre hochgeladenen Bilder und Spiele löschen; dies entfernt die Dateien/Verweise für die Zukunft.
                Bereits geteilte Direkt-URLs können bis zur Löschung durch Caches temporär erreichbar bleiben.
              </p>
            </div>

            {/* 6. Zulässige Nutzung */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="nutzung" className="text-xl font-bold tracking-tight">6. Zulässige Nutzung</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Keine rechtswidrigen, diskriminierenden, gewaltverherrlichenden oder pornografischen Inhalte.</li>
                <li>Keine Urheberrechtsverletzungen; verwende nur Inhalte, an denen du die Rechte hältst.</li>
                <li>Kein Missbrauch der Plattform (Spam, DDoS, Scans, Umgehung technischer Schutzmaßnahmen).</li>
                <li>Wahrung von Persönlichkeitsrechten: Einwilligungen einholen, wenn Personen identifizierbar sind.</li>
              </ul>
            </div>

            {/* 7. Verfügbarkeit & Änderungen */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="verfuegbarkeit" className="text-xl font-bold tracking-tight">7. Verfügbarkeit, Änderungen, Beta-Status</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>TheBuzz befindet sich im aktiven Ausbau (MVP). Es kann zu Wartungen, Updates und Änderungen kommen.</li>
                <li>Wir schulden keine bestimmte Verfügbarkeit oder störungsfreien Betrieb.</li>
                <li>Funktionen können angepasst, erweitert oder eingestellt werden.</li>
              </ul>
            </div>

            {/* 8. Haftung */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="haftung" className="text-xl font-bold tracking-tight">8. Haftung</h2>
              <p className="mt-2 opacity-90">
                Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach zwingenden gesetzlichen Vorschriften
                (z. B. Produkthaftung). Bei leichter Fahrlässigkeit haften wir nur für Schäden aus der Verletzung des Lebens,
                des Körpers oder der Gesundheit sowie für Schäden aus der Verletzung einer wesentlichen Vertragspflicht
                (Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht und auf deren
                Einhaltung der Vertragspartner regelmäßig vertrauen darf); in diesem Fall ist die Haftung auf den vorhersehbaren,
                typischerweise eintretenden Schaden begrenzt.
              </p>
            </div>

            {/* 9. Laufzeit & Beendigung */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="laufzeit" className="text-xl font-bold tracking-tight">9. Laufzeit &amp; Beendigung</h2>
              <ul className="mt-3 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Das Nutzungsverhältnis ist unbefristet und kann jederzeit von dir beendet werden (Account/Löschung).</li>
                <li>Bei Verstößen gegen diese Bedingungen können wir den Zugang sperren oder Inhalte entfernen.</li>
              </ul>
            </div>

            {/* 10. Geistiges Eigentum */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="ip" className="text-xl font-bold tracking-tight">10. Geistiges Eigentum</h2>
              <p className="mt-2 opacity-90">
                Die Plattform, Software, Marken und Designs von TheBuzz sind urheber- und kennzeichenrechtlich geschützt.
                Du erhältst lediglich ein einfaches, widerrufliches Nutzungsrecht zur Verwendung des Dienstes gemäß diesen Bedingungen.
                Inhalte, die du hochlädst, bleiben – soweit rechtlich möglich – dein Eigentum; du räumst uns für den Betrieb
                ein einfaches Nutzungsrecht ein (Speichern, Anzeigen, Übertragen, Verarbeiten).
              </p>
            </div>

            {/* 11. Anwendbares Recht */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="recht" className="text-xl font-bold tracking-tight">11. Anwendbares Recht &amp; Gerichtsstand</h2>
              <p className="mt-2 opacity-90">
                Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Sofern gesetzlich zulässig,
                ist Gerichtsstand <strong>[Ort]</strong>. Zwingende Verbraucherschutzvorschriften des Wohnsitzstaats bleiben unberührt.
              </p>
            </div>

            {/* 12. Änderungen der Bedingungen */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 id="aenderungen" className="text-xl font-bold tracking-tight">12. Änderungen dieser Bedingungen</h2>
              <p className="mt-2 opacity-90">
                Wir können diese Bedingungen anpassen, wenn sich der Dienst, rechtliche Rahmenbedingungen oder berechtigte
                Interessen ändern. Über wesentliche Änderungen informieren wir angemessen (z. B. In-App-Hinweis). Die aktuelle
                Fassung ist jederzeit unter <Link className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="/terms">/terms</Link> abrufbar.
              </p>
            </div>

            {/* Footer Hinweis */}
            <div className="text-sm opacity-70">
              Hinweis: Diese Seite ist eine Vorlage und ersetzt keine Rechtsberatung. Bitte ergänze die Platzhalter (Anbieter, Ort) und
              gleiche die Formulierungen mit deiner <Link className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="/privacy">Datenschutzerklärung</Link> ab.
            </div>

            <div className="mt-4 flex gap-4">
              <Link className="text-sm underline decoration-dotted underline-offset-4 hover:opacity-80" href="/impressum">
                Zum Impressum
              </Link>
              <Link className="text-sm underline decoration-dotted underline-offset-4 hover:opacity-80" href="/privacy">
                Zur Datenschutzerklärung
              </Link>
            </div>
          </article>

          {/* Aside / Inhaltsverzeichnis */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-5 shadow-sm">
              <h3 className="text-sm font-semibold">Inhalt</h3>
              <ul className="mt-3 space-y-2 text-sm opacity-90">
                <li><a className="hover:opacity-80" href="#anbieter">1. Anbieter & Geltung</a></li>
                <li><a className="hover:opacity-80" href="#preis">2. Unentgeltlichkeit</a></li>
                <li><a className="hover:opacity-80" href="#konten">3. Konten & Teilnahme</a></li>
                <li><a className="hover:opacity-80" href="#daten">4. Daten & Speicherorte</a></li>
                <li><a className="hover:opacity-80" href="#bilder">5. Bild-Uploads (S3)</a></li>
                <li><a className="hover:opacity-80" href="#nutzung">6. Zulässige Nutzung</a></li>
                <li><a className="hover:opacity-80" href="#verfuegbarkeit">7. Verfügbarkeit</a></li>
                <li><a className="hover:opacity-80" href="#haftung">8. Haftung</a></li>
                <li><a className="hover:opacity-80" href="#laufzeit">9. Laufzeit & Beendigung</a></li>
                <li><a className="hover:opacity-80" href="#ip">10. Geistiges Eigentum</a></li>
                <li><a className="hover:opacity-80" href="#recht">11. Recht/Gerichtsstand</a></li>
                <li><a className="hover:opacity-80" href="#aenderungen">12. Änderungen</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
