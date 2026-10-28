import mongoose from "mongoose";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { selectedGameId } = req.body;
  const auth = await requireGameOwner(req, res, selectedGameId);
  if (!auth) return;

  try {
    const userObjId = new mongoose.Types.ObjectId(auth.session.user.id);
    const newGameId = new mongoose.Types.ObjectId(selectedGameId);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userObjId },
      { $set: { chosengame: newGameId } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "Benutzer nicht gefunden" });
    }

    return res.status(200).json({ message: "Spiel gewechselt", game: updatedUser.chosengame });
  } catch (error) {
    console.error("Error changing active game:", error);
    return res.status(500).json({
      message: "Fehler beim Wechseln des Spiels",
      error: error.message,
    });
  }
}
