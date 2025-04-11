import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Game from "../../../db/models/Game";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await getServerSession(req, res, authOptions); 
  
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  const userId = session.user.id;

  const { name } = req.body;


  try {
   
    const newGame = await Game.create({
      name: name,     
      admin: userId,   
      started: false, 
    });

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          $push: { yourgames: newGame._id },  
          chosengame: newGame._id,
        },
        { new: true }
      );
      

    return res.status(201).json({ message: "Game created", game: newGame, user: updatedUser });
  } catch (error) {
    console.error("Fehler beim Erstellen des Spiels:", error);
    return res.status(500).json({ message: "Fehler beim Erstellen des Spiels", error: error.message });
  }
}