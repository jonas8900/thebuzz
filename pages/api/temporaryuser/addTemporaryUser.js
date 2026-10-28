import mongoose from "mongoose";
import dbConnect from "../../../db/connect";
import Temporaryuser from "../../../db/models/Temporaryuser";
import Game from "../../../db/models/Game";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getClientIpFromReq, hashIp } from "@/lib/hashIp";

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 5,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const clientIp = getClientIpFromReq(req);
  try {
    await rateLimiter.consume(clientIp);
  } catch {
    return res.status(429).json({
      message: "Zu viele Anfragen. Bitte versuche es später erneut.",
      error: "Zu viele Anfragen. Bitte versuche es später erneut.",
    });
  }

  await dbConnect();

  const username = req.body?.username?.trim();
  const gameId = req.body?.gameId;

  if (!username || username.length < 3) {
    return res.status(400).json({
      message: "Der Benutzername muss mindestens 3 Zeichen lang sein.",
    });
  }

  if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Ungültige Spiel-ID." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Spiel nicht gefunden." });
    }

    const hashedIp = hashIp(clientIp);
    if (game.blockedips.includes(hashedIp)) {
      return res.status(403).json({
        message: "Deine IP-Adresse wurde für dieses Spiel gesperrt.",
      });
    }

    if (game.joinstopped) {
      return res.status(400).json({
        message: "Der Spielleiter hat den Beitritt für dieses Spiel geschlossen.",
      });
    }

    const existingUser = await Temporaryuser.findOne({
      username,
      yourgame: gameId,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Dieser Benutzername ist in diesem Spiel bereits vergeben.",
      });
    }

    const newTemporaryUser = await Temporaryuser.create({
      username,
      yourgame: gameId,
      ipHash: hashedIp,
    });

    game.players.push({
      playerId: newTemporaryUser._id,
      username: newTemporaryUser.username,
    });

    await game.save();

    return res.status(201).json({
      message: "Spiel erfolgreich beigetreten!",
      temporaryUser: newTemporaryUser,
    });
  } catch (error) {
    console.error("Error creating temporary user:", error);
    return res.status(500).json({
      message: "Fehler beim Beitreten des Spiels.",
      error: error.message,
    });
  }
}
