import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import Game from "../../../db/models/Game";
import User from "../../../db/models/User";

export default async function handler(request, response) {
  await dbConnect();

  const session = await getServerSession(request, response, authOptions); 

  if (!session) {
    return response.status(403).json({ message: "No access" });
  }

  if (request.method === "GET") {
    try {
      const userId = session.user.id;



      if (!userId) {
        return response.status(403).json({ message: "Kein User gefunden" });
      }

      const user = await User.findById(userId).lean();

      if (!user) {
        return response.status(404).json({ message: "User nicht gefunden" });
      }

      const chosenGameId = user.chosengame; 

      const chosenGame = await Game.findById(chosenGameId)
      .populate("players", "username")    
      .populate("admin", "username")      
      .populate("scores.player", "username") 
      .populate("questions")
      .lean();
    
    


      return response.status(200).json({ chosenGame });
    } catch (error) {
      console.error("Fehler beim Abrufen der Spiele:", error);
      return response.status(400).json({ error: error.message });
    }
  } else {
    response.status(405).json({ error: "Methode nicht erlaubt" });
  }
}
