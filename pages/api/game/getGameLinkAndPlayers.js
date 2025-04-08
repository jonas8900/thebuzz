
import { getServerSession } from "next-auth";
import Game from "../../../db/models/Game";
import dbConnect from "../../../db/connect";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(request, response) {
  await dbConnect();
  const session = await getServerSession(request, response, authOptions);

  if (!session) {
    return response.status(403).json({ message: "No access" });
  }

  const { id } = request.query;

  if(request.method === "POST") {
    try {

        const newInviteLink = process.env.COPYLINK_URL + "?code=" + Math.random().toString(36).substring(2, 16) + "&x=" + id;

        const game = await Game.findByIdAndUpdate(
            id,
            { invitelink: newInviteLink },
            { new: true }
        );

        if(!game) {
            return response.status(404).json({message: "Spiel nicht gefunden."});
        }

        return response.status(200).json(game);
        }
        catch (error) {
        return response.status(500).json({ error: error.message });
        }
  }

  if (request.method === "GET") {


        try {
        const game = await Game.findById(id)
            .select("invitelink players")
            .lean();

        if (!game) {
            return response.status(404).json({ message: "Spiel nicht gefunden" });
        }

        return response.status(200).json(game);
        } catch (error) {
        return response.status(500).json({ error: error.message });
        }
    }
}
