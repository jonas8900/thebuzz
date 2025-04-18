import dbConnect from "../../../db/connect";
import Temporaryuser from "../../../db/models/Temporaryuser";
import Game from "../../../db/models/Game";
import { RateLimiterMemory } from 'rate-limiter-flexible';


const rateLimiter = new RateLimiterMemory({
  points: 10,  
  duration: 60 * 5,  
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  try {
    await rateLimiter.consume(ip); 
  } catch (rateLimiterRes) {
    return res.status(429).json({ error: "Zu viele Anfragen. Bitte versuche es später erneut." });
  }

  await dbConnect();

  const { username, gameId } = req.body;

  try {
    const existingUser = await Temporaryuser.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }


    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if(game.players.length > 5) {
      return res.status(400).json({ message: "Game is full" });
    }

    if (game.joinstopped) {
      return res.status(400).json({ message: "Admin stopped joining" });
    }

    const newTemporaryUser = await Temporaryuser.create({
      username: username,
      yourgame: gameId,
    });

    game.players.push({
      playerId: newTemporaryUser._id,
      username: newTemporaryUser.username,
    });
    
    await game.save();

    return res
      .status(201)
      .json({
        message: "Temporary user created and game opened",
        temporaryUser: newTemporaryUser,
      });
  } catch (error) {
    console.error("Error creating temporary user:", error);
    return res
      .status(500)
      .json({ message: "Error creating temporary user", error: error.message });
  }
}
