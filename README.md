# TheBuzz - Echtzeit-Quiz

**TheBuzz** ist ein webbasiertes Multiplayer-Quiz für Spieleabende, Streams, Hochzeiten und Teamevents. Ein Host (Admin) erstellt eigene Quizrunden mit verschiedenen Fragetypen und teilt einen Einladungslink. Alle Mitspieler treten direkt im Browser über ihr Smartphone oder den Desktop bei, ohne sich vorher registrieren zu müssen.

## Architektur & Technische Umsetzung

### 1. Custom Node.js Server (Next.js + Express + Socket.IO)
Anstatt Frontend und WebSocket-Server getrennt zu betreiben, läuft Next.js eingebettet in einem eigenen Express-Server (`Express/server.js`) auf demselben HTTP-Server wie Socket.IO:
- **Reine WebSocket-Kommunikation im Spiel:** Während einer laufenden Runde werden Statusänderungen (Buzzer, Antworten, Punkte, aktive Frage) ausschließlich über WebSockets an den jeweiligen Raum (`gameId`) gepusht. Dadurch entstehen im laufenden Spiel keine unnötigen HTTP-Requests.
- **Anti-Cheat auf Protokollebene:** Bevor ein Spielstatus per WebSocket an die verbundenen Clients gesendet wird, entfernt der Server automatisch das Feld `correctanswer` aller Fragen. Erst wenn der Admin aktiv auf "Antwort aufdecken" klickt, wird die Lösung für genau diese Frage freigegeben.
- **Atomare Buzzer-Locks im Arbeitsspeicher:** Wenn 20 Personen gleichzeitig auf den Buzzer drücken, entscheidet ein synchroner In-Memory-Lock (`buzzerLocks`) vor dem Datenbank-Schreibzugriff, wer zuerst gedrückt hat. Dadurch sind Race-Conditions durch parallele MongoDB-Abfragen ausgeschlossen.

### 2. Hybrides Session-Konzept mit NextAuth
Die Anwendung unterscheidet zwischen zwei Nutzergruppen innerhalb derselben NextAuth-Konfiguration (`pages/api/auth/[...nextauth].js`):
- **Admins:** Login über E-Mail/Passwort (`bcryptjs`) oder Google OAuth, geschützt durch Rate-Limiting (`rate-limiter-flexible`) und Ownership-Prüfungen (`lib/authGuard.js`) auf allen Admin-Endpunkten.
- **Gast-Spieler (`Temporaryuser`):** Treten nur mit einem Anzeigenamen bei (eindeutig pro Spiel über einen Compound-Index `{ username: 1, yourgame: 1 }`). Falls auf dem Smartphone der Bildschirm ausgeht oder die Seite neu geladen wird, stellt das System die bestehende Spiel-Session anhand der `gameId` wieder her, ohne dass Punkte verloren gehen.

### 3. Datenschutzfreundlicher Missbrauchsschutz (SHA-256 IP-Hashing)
Da Mitspieler keinen Account benötigen, müssen Störer im Zweifel vom Spielleiter aus einer Lobby entfernt und für dieses Spiel gesperrt werden können. Um dabei keine personenbezogenen Klartext-IPs in der Datenbank zu speichern, werden Client-IPs direkt beim Beitritt über `lib/hashIp.js` normalisiert und per SHA-256 gehasht.

### 4. Client-seitige Bildkomprimierung & S3-Upload
Für Bilderfragen können Admins eigene Fotos hochladen. Um die Bandbreite aller Mitspieler im Live-Spiel zu schonen, konvertiert und komprimiert das Frontend (`browser-image-compression` im Web-Worker) jedes Bild vor dem Upload automatisch ins `WebP`-Format (`< 300 KB`, max. 900 px). Serverseitig werden Dateigröße und MIME-Type durch `formidable` validiert und anschließend in einen AWS S3 Bucket übertragen.

### 5. Datenbank-Resilienz & Server-Side Caching
- **Statistik-Cache:** Die Live-Statistiken auf der Startseite (`/api/stats`) bündeln fünf parallele MongoDB-Abfragen über einen serverseitigen In-Memory-Cache (5 Minuten TTL inklusive In-Flight-Deduplizierung bei gleichzeitigem Seitenaufruf).
- **MongoDB Keep-Alive:** Über den Endpunkt `/api/health` (kombiniert mit einem internen 6-Stunden-Intervall und einer geplanten GitHub Action in `.github/workflows/mongodb-keepalive.yml`) wird regelmäßig ein leichtgewichtiger Lesezugriff ausgeführt, damit der MongoDB-Cluster bei längeren Spielpausen nicht pausiert.

## Spielmodi

- **Buzzer-Frage:** Alle sehen die Frage, der schnellste Buzzer sperrt die Runde für alle anderen und der Spieler gibt seine Antwort live ab.
- **Multiple Choice:** Bis zu 4 Antwortmöglichkeiten mit automatischer Punktevergabe beim Aufdecken der Lösung.
- **Wahr / Falsch:** Schnelle Entscheidungsrunde mit automatischer Auswertung.
- **Offene Frage / Schätzfrage:** Alle Spieler tippen ihre Antwort verdeckt ein; der Admin deckt die Antworten auf und vergibt die Punkte per Klick an die beste(n) Antwort(en).
- **Bilderfrage:** Wie die offene Frage, ergänzt um ein komprimiertes Vorschaubild.
- **Reihenfolge:** Fragen können entweder zufällig (`random`) gezogen oder vorab per Drag & Drop (`@dnd-kit`) in eine feste Reihenfolge (`sorted`) gebracht werden.

## Tech-Stack

- **Frontend:** Next.js 15 (Pages Router), React 18, Tailwind CSS v4, Framer Motion, SWR, `@dnd-kit`
- **Backend & Echtzeit:** Node.js 20, Express, Socket.IO
- **Datenbank:** MongoDB & Mongoose
- **Authentifizierung:** NextAuth.js (Credentials, Google OAuth, Guest Provider)
- **Storage & E-Mail:** AWS SDK v3 (`@aws-sdk/client-s3`), Nodemailer
- **Deployment:** Coolify (Hetzner)

## Lokale Entwicklung

### 1. Repository klonen & Abhängigkeiten installieren

```bash
git clone https://github.com/jonas8900/thebuzz.git
cd thebuzz
npm install
```

### 2. Umgebungsvariablen konfigurieren

Lege im Projektverzeichnis eine `.env.local` an:

```env
# Datenbank
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/takethebuzz

# NextAuth & Security
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dein-nextauth-secret
HEALTHCHECK_TOKEN=optionaler-token-fuer-api-health

# Google OAuth (optional für Admin-Login)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# AWS S3 (für Bilderfragen)
AWS_REGION=eu-central-1
AWS_BUCKET_NAME=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# SMTP / Nodemailer (für Passwort-Reset & Einladungs-Mails)
EMAIL_USER=...
EMAIL_PASS=...

# Optional: Falls der Socket-Server auf einer separaten Domain läuft
# (Bei lokalem Betrieb oder Single-Container-Deployment auf Coolify leer lassen)
NEXT_PUBLIC_SOCKET_URL=
```

### 3. Entwicklungsserver starten

Da die Anwendung einen Custom Express-Server für Socket.IO nutzt, wird im Entwicklungsbetrieb der kombinierte Server gestartet:

```bash
npm run dev:server
```

### 4. Produktions-Build & Start

```bash
npm run build
npm start
```

`npm start` führt `node Express/server.js` im Produktionsmodus aus und liefert sowohl die gebaute Next.js-App als auch den Socket.IO-Server über denselben Port (`PORT`) aus.
