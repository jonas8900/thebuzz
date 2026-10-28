import Game from "../../../db/models/Game";
import dbConnect from "../../../db/connect";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { gameId, gamemode } = req.body;
  const auth = await requireGameOwner(req, res, gameId);
  if (!auth) return;

  const allowedModes = ["random", "buzzergame", "lowtohigh", "sorted"];
  if (!allowedModes.includes(gamemode)) {
    return res.status(400).json({ message: "Ungültiger Spielmodus" });
  }

  try {
    const game = await Game.findByIdAndUpdate(
      gameId,
      { gamemode },
      { new: true }
    );

    return res.status(200).json({ message: "Spielmodus aktualisiert", game });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
