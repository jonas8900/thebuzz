import { getServerSession } from "next-auth";
import Temporaryuser from "../../../../db/models/Temporaryuser";
import Game from "../../../../db/models/Game";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../db/connect";
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  const { playerId, gameId } = req.body;

  console.log(playerId);

  console.log(ip);

  if (!gameId || !playerId) {
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

    if (game.blockedips.includes(ip)) {
      return res.status(403).json({ message: "Your IP has been blocked for this game" });
    }

    console.log(playerId,"playerid");


    const temporaryUser = await Temporaryuser.findById(playerId);

    if (!temporaryUser) {

      return res.status(404).json({ message: "User not found" });
    }

    if (!game.blockedips.includes(ip) && temporaryUser) {
      game.blockedips.push(ip);
      await game.save();
    } else {
      return res.status(403).json({ message: "Your IP has already been blocked for this game or User not found" });
    }

    // Delete the temporary user
    temporaryUser.deleteOne({ _id: playerId });
    console.log("Temporary user deleted:");

    return res.status(201).json({ message: "User deleted and IP blocked", game: game });
  } catch (error) {
    console.error("Fehler beim löschen des Users:", error);
    return res.status(500).json({ message: "Fehler beim löschen des Users", error: error.message });
  }
}
