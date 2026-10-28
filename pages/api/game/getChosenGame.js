import dbConnect from "../../../db/connect";
import Game from "../../../db/models/Game";
import User from "../../../db/models/User";
import "../../../db/models/Temporaryuser";
import "../../../db/models/Task";
import { requireAdminSession } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Methode nicht erlaubt" });
  }

  await dbConnect();

  const session = await requireAdminSession(req, res);
  if (!session) return;

  try {
    const userId = session.user.id;
    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    let chosenGameId = user.chosengame;

    // Fallback to the admin's most recent game if chosengame is unset
    if (!chosenGameId) {
      const firstGame = await Game.findOne({ admin: userId }).select("_id").lean();
      if (firstGame) {
        chosenGameId = firstGame._id;
        await User.findByIdAndUpdate(userId, { $set: { chosengame: chosenGameId } });
      }
    }

    if (!chosenGameId) {
      return res.status(200).json({ chosenGame: null });
    }

    const chosenGame = await Game.findOne({ _id: chosenGameId, admin: userId })
      .populate({
        path: "players.playerId",
        select: "username points",
      })
      .populate("admin", "username")
      .populate("scores.results.player")
      .populate("questions")
      .populate({
        path: "blockedusers.user",
        model: "Temporaryuser",
        select: "username",
      })
      .lean();

    return res.status(200).json({ chosenGame: chosenGame || null });
  } catch (error) {
    console.error("Error fetching chosen game:", error);
    return res.status(500).json({ error: error.message });
  }
}
