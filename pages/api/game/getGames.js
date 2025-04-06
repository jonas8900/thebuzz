import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import Game from "../../../db/models/Game";

export default async function handler(request, response) {
    await dbConnect();

    
      const session = await getServerSession(request, response, authOptions); 
      
      if (!session) {
        return response.status(403).json({ message: "No access" });
      }

      if (request.method === "GET") {
        try {
          const userId = session.user.id;
    
          
          const games = await Game.find({ players: userId })
                .select("_id name")
                .lean();

    
          if (games.length === 0) {
            return response.status(404).json({ message: "Keine Spiele gefunden" });
          }
    
          return response.status(200).json(games); 
        } catch (error) {
          console.error("Fehler beim Abrufen der Spiele:", error);
          return response.status(400).json({ error: error.message });
        }
      } else {
        response.status(405).json({ error: "Methode nicht erlaubt" });
      }
    }
