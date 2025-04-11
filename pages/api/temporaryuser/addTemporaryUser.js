import dbConnect from "../../../db/connect";
import Temporaryuser from "../../../db/models/Temporaryuser";
import Game from "../../../db/models/Game";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { username, gameId } = req.body;
  console.log(username, gameId);

  try {
    const existingUser = await Temporaryuser.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newTemporaryUser = await Temporaryuser.create({
      username: username,
      yourgame: gameId,
    });

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    game.players.push(newTemporaryUser._id);
    game.currentplayer.push(newTemporaryUser._id);
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
