import dbConnect from "../../../../db/connect";
import Game from "../../../../db/models/Game";
import "../../../../db/models/Task";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { gameId, newQuestionOrder } = req.body;

  if (!gameId || !Array.isArray(newQuestionOrder)) {
    return res.status(400).json({ message: "Ungültige Daten" });
  }

  const auth = await requireGameOwner(req, res, gameId);
  if (!auth) return;

  try {
    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { questions: newQuestionOrder },
      { new: true }
    ).populate("questions");

    return res.status(200).json({
      message: "Reihenfolge aktualisiert",
      game: updatedGame,
    });
  } catch (error) {
    console.error("Error updating question order:", error);
    return res.status(500).json({ message: "Serverfehler" });
  }
}
