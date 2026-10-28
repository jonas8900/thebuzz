import Task from "../../../../db/models/Task";
import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { questionData } = req.body;
  if (!questionData?.gameId) {
    return res.status(400).json({ message: "Spiel-ID fehlt." });
  }

  const auth = await requireGameOwner(req, res, questionData.gameId);
  if (!auth) return;

  try {
    const newQuestion = await Task.create({
      question: questionData.question,
      correctanswer: questionData.correctanswer,
      ...(questionData.answers && { answers: questionData.answers }),
      mode: questionData.mode,
      gameId: questionData.gameId,
      points: Number(questionData.points),
      pointsgiven: Boolean(questionData.pointsgiven),
    });

    const updatedGame = await Game.findByIdAndUpdate(
      questionData.gameId,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Frage erstellt! 🎉",
      game: updatedGame,
      question: newQuestion,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return res.status(500).json({
      message: "Fehler beim Erstellen der Frage.",
      error: error.message,
    });
  }
}
