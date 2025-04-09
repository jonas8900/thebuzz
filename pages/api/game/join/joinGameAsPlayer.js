import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../db/connect";
import Game from "../../../../db/models/Game";
import User from "../../../../db/models/User";




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

  const { gameLink } = req.body;

  const parsedURL = new URL(gameLink);
  const gameId = parsedURL.searchParams.get('x');

  try {
   


    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          $push: { yourgames: gameId },  
          chosengame: gameId              
        },
        { new: true }
      );

      const updateGame = await Game.findByIdAndUpdate(
        gameId,
        { $push: { players: userId } },
        { new: true }
      )
      

    return res.status(201).json({ message: "joined Game", game: updateGame, user: updatedUser });
  } catch (error) {
    console.error("Fehler beim Joinen des Spiels:", error);
    return res.status(500).json({ message: "Fehler beim Joinen des Spiels", error: error.message });
  }
}