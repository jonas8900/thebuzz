import Link from "next/link";

export default function Banned() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-4">Zugriff verweigert</h1>
            <p className="text-lg mb-8">Deine IP-Adresse wurde für dieses Spiel blockiert.</p>
            <p className="text-lg mb-8">Bitte kontaktiere den Spielleiter, um weitere Informationen zu erhalten.</p>
            <Link href="/" className="text-blue-500 hover:underline">Zurück zur Startseite</Link>
        </div>
    );
}