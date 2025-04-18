import dbConnect from "../../../../db/connect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import Task from "../../../../db/models/Task";
import Game from "../../../../db/models/Game";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

    const session = await getServerSession(req, res, authOptions); 
    
    if (!session) {
      return res.status(403).json({ message: "No access" });
    }
  

  const { gameId, newQuestionOrder } = req.body;

  if (!gameId || !Array.isArray(newQuestionOrder)) {
    return res.status(400).json({ message: "Ungültige Daten" });
  }

  try {
    await dbConnect();

    const updatedGame = await Game.findByIdAndUpdate(
      gameId,
      { questions: newQuestionOrder },
      { new: true }
    ).populate("questions");

    return res.status(200).json({ message: "Reihenfolge aktualisiert", game: updatedGame });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Serverfehler" });
  }
}
