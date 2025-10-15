// pages/impressum.js
import Link from "next/link";

export default function Impressum() {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-violet-100 via-fuchsia-50 to-sky-50 dark:from-[#0b0b13] dark:via-[#11142a] dark:to-[#1b0f2e] text-slate-900 dark:text-slate-100">
      {/* Hero */}
      <section className="border-b border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-blue-600" />
              Rechtliche Angaben · EU-Hosting
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Impressum</h1>
            <p className="opacity-80">Angaben gemäß § 5 TMG</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
          {/* Main */}
          <article className="space-y-8">
            {/* Anbieter */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="anbieter">1. Anbieter</h2>
              <p className="mt-2 opacity-90">
                <strong>Jonas Maximilian Dally</strong><br />
                <br />
                [PLZ] [Ort], [Land]
              </p>
            </div>

            {/* Kontakt */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="kontakt">2. Kontakt</h2>
              <p className="mt-2">
                E-Mail:{" "}
                <a className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="mailto:[kontakt@deinedomain.tld]">
                  [kontakt@deinedomain.tld]
                </a>
                <br />
                Telefon (optional): [+49 …]
              </p>
            </div>

            {/* Vertretung / Register */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="vertretung">3. Vertretungsberechtigt</h2>
              <p className="mt-2 opacity-90">
                [Name der vertretungsberechtigten Person/en] (bei Einzelunternehmen: identisch mit Anbieter)
              </p>
              <h3 className="mt-4 font-semibold">Register &amp; USt-ID (falls vorhanden)</h3>
              <ul className="mt-2 list-disc pl-5 text-sm opacity-90 space-y-1">
                <li>Handelsregister: [Registergericht], HRB/HRA: [Nummer]</li>
                <li>USt-IdNr. gemäß § 27a UStG: [DE…]</li>
                <li>W-IdNr. (optional): [DE…]</li>
              </ul>
            </div>

            {/* Aufsichtsbehörde */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="aufsicht">4. Aufsichtsbehörde (falls zutreffend)</h2>
              <p className="mt-2 opacity-90">
                [Bezeichnung der zuständigen Aufsichtsbehörde, Anschrift]
              </p>
            </div>

            {/* Verantwortlich i.S.d. MStV */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="verantwortlich">5. Verantwortlich nach § 18 Abs. 2 MStV</h2>
              <p className="mt-2 opacity-90">
                <strong>[Name]</strong><br />
                [Straße Hausnummer], [PLZ] [Ort], [Land]
              </p>
            </div>

            {/* EU-Hosting Hinweis */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="hosting">6. EU-weit gehostet</h2>
              <p className="mt-2 opacity-90">
                TheBuzz wird ausschließlich auf Servern in der Europäischen Union betrieben. Es findet kein
                Drittlandtransfer personenbezogener Daten außerhalb der EU/EWR statt. Details siehe{" "}
                <Link className="underline decoration-dotted underline-offset-4 hover:opacity-80" href="/privacy">
                  Datenschutzerklärung
                </Link>.
              </p>
            </div>

            {/* Haftung für Inhalte */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="haftung-inhalte">7. Haftung für Inhalte</h2>
              <p className="mt-2 opacity-90">
                Wir sind gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.
                Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
                überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur
                Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
                Eine diesbezügliche Haftung ist jedoch erst ab Kenntnis einer konkreten Rechtsverletzung möglich. Bei
                Bekanntwerden entsprechender Rechtsverletzungen entfernen wir diese Inhalte umgehend.
              </p>
            </div>

            {/* Haftung für Links */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="haftung-links">8. Haftung für Links</h2>
              <p className="mt-2 opacity-90">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb
                können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets
                der jeweilige Anbieter oder Betreiber verantwortlich. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
                erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
                Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.
              </p>
            </div>

            {/* Urheberrecht */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="urheberrecht">9. Urheberrecht</h2>
              <p className="mt-2 opacity-90">
                Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter
                sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb
                der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads
                und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet, sofern nicht anders angegeben.
              </p>
            </div>

            {/* Mediennachweise */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="medien">10. Bild-/Mediennachweise</h2>
              <p className="mt-2 opacity-90">
                Verwendete Bilder/Grafiken: [Eigene Bilder / Quellenangaben mit Lizenzhinweisen, z. B. Unsplash/Name, Lizenz], sofern zutreffend.
              </p>
            </div>

            {/* OS-Plattform */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="os">11. Online-Streitbeilegung &amp; Verbraucherschlichtung</h2>
              <p className="mt-2 opacity-90">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
                <a
                  className="underline decoration-dotted underline-offset-4 hover:opacity-80"
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://ec.europa.eu/consumers/odr
                </a>. Wir sind nicht verpflichtet und grundsätzlich nicht bereit, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            {/* Berufshaftpflicht (optional) */}
            <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/10 p-6 shadow-sm">
              <h2 className="text-xl font-bold tracking-tight" id="versicherung">12. Berufshaftpflicht (falls vorhanden)</h2>
              <p className="mt-2 opacity-90">
                Versicherer: [Name, Anschrift]<br />
                Räumlicher Geltungsbereich: [z. B. EU-weit]
              </p>
            </div>

            {/* Footer Hinweis */}
            <div className="text-sm opacity-70">
              Hinweis: Diese Seite ist eine Vorlage und ersetzt keine Rechtsberatung. Bitte ergänze alle Platzhalter (Register, USt-ID, Aufsicht, Mediennachweise) und halte die Angaben aktuell.
            </div>

            <div className="mt-4">
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
                <li><a className="hover:opacity-80" href="#anbieter">1. Anbieter</a></li>
                <li><a className="hover:opacity-80" href="#kontakt">2. Kontakt</a></li>
                <li><a className="hover:opacity-80" href="#vertretung">3. Vertretung/Register</a></li>
                <li><a className="hover:opacity-80" href="#aufsicht">4. Aufsichtsbehörde</a></li>
                <li><a className="hover:opacity-80" href="#verantwortlich">5. Verantwortlich i.S.d. MStV</a></li>
                <li><a className="hover:opacity-80" href="#hosting">6. EU-Hosting</a></li>
                <li><a className="hover:opacity-80" href="#haftung-inhalte">7. Haftung Inhalte</a></li>
                <li><a className="hover:opacity-80" href="#haftung-links">8. Haftung Links</a></li>
                <li><a className="hover:opacity-80" href="#urheberrecht">9. Urheberrecht</a></li>
                <li><a className="hover:opacity-80" href="#medien">10. Mediennachweise</a></li>
                <li><a className="hover:opacity-80" href="#os">11. OS/Schlichtung</a></li>
                <li><a className="hover:opacity-80" href="#versicherung">12. Berufshaftpflicht</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
