import dbConnect from "../../../../db/connect";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, gameId } = req.body;

  if (!gameId || !userId) {
    return res.status(400).json({ message: "Spiel-ID und Benutzer-ID sind erforderlich." });
  }

  await dbConnect();

  const auth = await requireGameOwner(req, res, gameId);
  if (!auth) return;

  try {
    const { game } = auth;

    const blockedEntry = game.blockedusers.find(
      (entry) => entry.user && entry.user.toString() === String(userId)
    );

    if (!blockedEntry) {
      return res.status(404).json({ message: "Blockierter Spieler nicht gefunden." });
    }

    const userIp = blockedEntry.blockedip;

    game.blockedusers = game.blockedusers.filter(
      (entry) => entry.user && entry.user.toString() !== String(userId)
    );

    if (userIp) {
      game.blockedips = game.blockedips.filter((ip) => ip !== userIp);
    }

    await game.save();
    return res.status(200).json({ message: "Spieler erfolgreich entsperrt." });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({
      message: "Fehler beim Entsperren des Spielers.",
      error: error.message,
    });
  }
}
