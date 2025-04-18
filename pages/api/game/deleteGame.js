import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Game from "../../../db/models/Game";
import Temporaryuser from "../../../db/models/Temporaryuser";
import Task from "../../../db/models/Task";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await getServerSession(req, res, authOptions); 
  
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  const { gameId } = req.body;

  try {
   
    const deletedGame = await Game.findByIdAndDelete(gameId);

    const temporaryUser = await Temporaryuser.deleteMany({yourgame: gameId});

    const questions = await Task.deleteMany({gameId: gameId});

    if (!deletedGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    await User.updateMany(
        { yourgames: gameId }, 
        { $pull: { yourgames: gameId } } 
      );

    return res.status(201).json({ message: "Game deleted", game: deletedGame, temporaryUser, questions });
  } catch (error) {
    console.error("Fehler beim Erstellen des Spiels:", error);
    return res.status(500).json({ message: "Fehler beim Erstellen des Spiels", error: error.message });
  }
}