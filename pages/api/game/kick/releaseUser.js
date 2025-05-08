import { getServerSession } from "next-auth";
import Temporaryuser from "../../../../db/models/Temporaryuser";
import Game from "../../../../db/models/Game";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../db/connect";



export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, gameId } = req.body;

  if (!gameId || !gameId) {
    return res.status(400).json({ message: "Missing gameId or playerId" });
  }

  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    const userIp = game.blockedusers.find(user => user.user.toString() === userId)?.blockedip;
    const foundIp = game.blockedips.find(ip => ip === userIp);



    if (!foundIp || !userIp) {
        return res.status(403).json({ message: "Userip oder ip nicht gefunden" });
    }

    game.blockedusers = game.blockedusers.filter(user => user.user.toString() !== userId);
    game.blockedips = game.blockedips.filter(ip => ip !== userIp);
    
    await game.save();
    res.status(200).json({ message: "User erfolgreich unblocked" });
  } catch (error) {
    console.error("Fehler beim unblocken des Users:", error);
    return res.status(500).json({ message: "Fehler beim löschen des Users", error: error.message });
  }
}
