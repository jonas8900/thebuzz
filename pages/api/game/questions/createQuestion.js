import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import Task from "../../../../db/models/Task";
import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";




export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await getServerSession(req, res, authOptions); 
  
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

    const { questionData } = req.body;

    console.log(questionData)

  try {

    const newQuestion = await Task.create({
        question: questionData.question,
        correctanswer: questionData.correctanswer,
        ...(questionData.answers && { answers: questionData.answers }),
        mode: questionData.mode,
        gameId: questionData.gameId,
        points: questionData.points,
        pointsgiven: questionData.pointsgiven,
        });

    const updatedGame = await Game.findByIdAndUpdate(
        questionData.gameId,
        { $push: { questions: newQuestion._id } },
        { new: true }
      );



    return res.status(201).json({ message: "Frage erstellt", game: updatedGame, question: newQuestion });
  } catch (error) {
    console.error("Fehler beim Erstellen der Frage:", error);
    return res.status(500).json({ message: "Fehler beim Erstellen der Frage", error: error.message });
  }
}