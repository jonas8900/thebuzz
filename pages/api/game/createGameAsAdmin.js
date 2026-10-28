import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Game from "../../../db/models/Game";
import { requireAdminSession } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await requireAdminSession(req, res);
  if (!session) return;

  const userId = session.user.id;
  const name = req.body?.name?.trim();

  if (!name) {
    return res.status(400).json({ message: "Bitte gib einen Spielnamen ein." });
  }

  try {
    const newGame = await Game.create({
      name,
      admin: userId,
      started: false,
      gamemode: "random",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { yourgames: newGame._id },
        chosengame: newGame._id,
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Spiel erfolgreich erstellt",
      game: newGame,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error creating game:", error);
    return res.status(500).json({
      message: "Fehler beim Erstellen des Spiels",
      error: error.message,
    });
  }
}
