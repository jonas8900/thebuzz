import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import Game from "../../../db/models/Game";

export default async function handler(request, response) {
  await dbConnect();

  if (request.method === "GET") {
    try {
      const { x } = request.query;

      if (!x || x == undefined) {
        return response.status(400).json({ error: "ID ist erforderlich" });
      }

      const game = await Game.findById(x);

      return response.status(200).json(game);
    } catch (error) {
      console.error("Fehler beim Abrufen der Spiele:", error);
      return response.status(400).json({ error: error.message });
    }
  } else {
    response.status(405).json({ error: "Methode nicht erlaubt" });
  }
}
