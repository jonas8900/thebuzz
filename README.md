# thebuzz — Realtime-Buzzer für Quiz & Spielabende

**thebuzz** ist eine schlanke, latenzarme Buzzer-App: Host startet eine Runde, Spieler*innen treten per Link/QR bei und **der erste Klick zählt** — inkl. Sperre für alle Nachfolgenden, Reset durch den Host und klarer Anzeige, wer gewonnen hat.

> Live-Demo: https://thebuzz-cfde756a15ca.herokuapp.com

---

## Features

- ⚡ **Echtzeit-Buzzer**: “First click wins”, alle anderen werden sofort gesperrt, bis der Host zurücksetzt.  
- 👥 **Mehrere Räume**: Trennung per Game-ID/Room (keine Cross-Talks zwischen Spielen).  
- 👩‍⚖️ **Host-Kontrollen**: Reset/Unlock, optional Spieler blockieren/entfernen.  
- 🎉 **UI-Feedback**: deutliche Hervorhebung/Auszeichnung des Gewinners, Animationen.  
- 📲 **Simple Join-Experience**: per Direktlink oder QR (mobil-freundlich).  
- 🔐 **Optionale Abuse-Guards**: Entprellung/Rate-Limit; IP-basierte Blocks (gehasht) möglich.  
- 🧩 **Erweiterbar**: Score-Board, Team-Modus, Timer, Soundeffekte usw. sind leicht nachrüstbar.

---

## Tech-Stack

- **Next.js (Pages-Router)** als UI-Framework  
- **Express** + **Socket.IO** (oder kompatibel) für Realtime/WebSockets  
- **Tailwind CSS** für Styles  
- Node.js-Runtime; Deployment z. B. auf **Heroku** (via `Procfile`)

> Die App ist so aufgebaut, dass Frontend (Next.js) und ein kleiner Node/Express-Server zusammenarbeiten. Der WebSocket-Teil sorgt für die Millisekunden-Reaktionszeit und Raum-Isolation.

---

## Architektur

```
Next.js (pages/) ── UI, Routing, SSR/CSR
         │
         ├─ components/   → UI-Bausteine
         ├─ styles/       → Tailwind & globale Styles
         ├─ public/       → statische Assets
         ├─ lib/          → Helper/Client-Logik (z. B. Socket-Client)
         ├─ db/           → (optional) Persistenz/Adapter
         └─ Express/      → Node/Express-Server + WebSocket (Rooms, Buzz-Lock)
```

**Ablauf (vereinfacht):**

1. Host erstellt/öffnet ein Spiel → Client tritt `room=<gameId>` bei.  
2. Spieler*innen joinen denselben Room.  
3. Beim ersten *Buzz* (Event) setzt der Server atomar den Gewinner und sperrt weitere Eingaben.  
4. Host kann per Event `reset` wieder freischalten.  
5. Broadcasts halten alle UIs synchron (Gewinner, Liste wartender Spieler, Status).

---

## Getting Started (lokal)

**Voraussetzungen**

- Node.js ≥ 18 wird empfohlen
- npm oder pnpm

**Installation**

```bash
git clone https://github.com/jonas8900/thebuzz.git
cd thebuzz
npm install
```

**Entwicklung starten**

> Je nach Skript-Setup in `package.json`:
```bash
# Variante A (Frontend + Server werden zusammen gestartet)
npm run dev

# Variante B (getrennt)
npm run dev:next      # Next.js
npm run dev:server    # Express/WebSocket mit nodemon
```

**Umgebungsvariablen (.env.local)**

```env
# Beispiel – an deine Skripte anpassen
PORT=3000
# Falls der WS-Server auf anderem Port läuft:
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

**Build & Start (prod)**

```bash
npm run build
npm start
```

---

## Ordnerstruktur

```
/Express         # Express/WebSocket-Server (Rooms, Buzz-Handling, Reset)
/components      # UI-Komponenten
/db              # (optional) DB/Persistenz
/lib             # Utilities, Client-Logik (z. B. Socket-Client)
/pages           # Pages-Router (Next.js)
/public          # statische Dateien
/styles          # Tailwind & globale Styles
Procfile         # Heroku Process-Definition
```

---

## Roadmap / Ideen

- [ ] Soundeffekte beim Buzz & beim Reset
- [ ] Team-Modus (Gruppenbuzzer, Mehrfachgewinner)
- [ ] Timer/Countdown pro Runde
- [X] Admin-Seite „Blockierte Spieler“ (Block/Unblock, Grund, Ablaufdatum)
- [X] Optionale Persistenz (Gewinner-Historie, Scores)
- [ ] Mehrsprachigkeit (DE/EN)

---

## Deployment

### Heroku

- `Procfile` ist vorhanden – damit lässt sich der Node-Prozess direkt starten.  
- Wichtige Variablen: `PORT` (wird von Heroku gesetzt).  
- Buildpacks: Node.js; evtl. zusätzliche für Monorepo/mehrere Prozesse je nach Setup.

### Alternativen

- Railway, Fly.io, Render (Node-App mit dauerhaftem Prozess).  
- Vercel eignet sich vor allem fürs Next.js-Frontend; für WebSockets meist separaten Node-Server betreiben.

---

## Mitmachen

Issues und PRs sind willkommen. Bitte achte auf:
- klare Commit-Messages
- kurze PRs mit Kontext
- keine sensiblen Secrets in Commits
