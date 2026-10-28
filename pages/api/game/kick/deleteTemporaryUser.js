import Temporaryuser from "../../../../db/models/Temporaryuser";
import dbConnect from "../../../../db/connect";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { playerId, gameId } = req.body;
  if (!gameId || !playerId) {
    return res.status(400).json({ message: "Spiel-ID und Spieler-ID sind erforderlich." });
  }

  await dbConnect();

  const auth = await requireGameOwner(req, res, gameId);
  if (!auth) return;

  try {
    const { game } = auth;
    const temporaryUser = await Temporaryuser.findById(playerId);

    if (!temporaryUser) {
      return res.status(404).json({ message: "Spieler nicht gefunden." });
    }

    // Use the player's stored IP hash (recorded when joining) rather than the admin's request IP
    const playerIpHash = temporaryUser.ipHash;

    const alreadyBlockedUser = game.blockedusers.some(
      (entry) => entry.user && entry.user.toString() === temporaryUser._id.toString()
    );

    if (!alreadyBlockedUser) {
      game.blockedusers.push({
        user: temporaryUser._id,
        blockedip: playerIpHash || "unknown",
      });
    }

    if (playerIpHash && !game.blockedips.includes(playerIpHash)) {
      game.blockedips.push(playerIpHash);
    }

    game.players = game.players.filter(
      (p) => p.playerId && p.playerId.toString() !== temporaryUser._id.toString()
    );

    await game.save();

    return res.status(200).json({
      message: "Spieler gekickt und für dieses Spiel gesperrt.",
      game,
    });
  } catch (error) {
    console.error("Error kicking player:", error);
    return res.status(500).json({
      message: "Fehler beim Entfernen des Spielers.",
      error: error.message,
    });
  }
}
