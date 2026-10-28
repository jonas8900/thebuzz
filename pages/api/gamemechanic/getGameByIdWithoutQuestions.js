import mongoose from "mongoose";
import dbConnect from "../../../db/connect";
import Game from "../../../db/models/Game";
import "../../../db/models/Temporaryuser";
import "../../../db/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Methode nicht erlaubt" });
  }

  await dbConnect();

  try {
    const { x } = req.query;

    if (!x || !mongoose.Types.ObjectId.isValid(x)) {
      return res.status(400).json({ error: "Gültige Spiel-ID ist erforderlich" });
    }

    const game = await Game.findById(x)
      .select("-questions -blockedips -blockedusers")
      .populate({
        path: "players.playerId",
        select: "username points",
      })
      .populate("admin", "username")
      .populate("scores.results.player", "username points")
      .lean();

    return res.status(200).json(game);
  } catch (error) {
    console.error("Error fetching game metadata:", error);
    return res.status(400).json({ error: error.message });
  }
}
