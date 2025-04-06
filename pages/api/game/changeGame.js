import mongoose from "mongoose";
import dbConnect from "../../../db/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import User from "../../../db/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    console.log("Keine Session gefunden.");
    return res.status(403).json({ message: "No access" });
  }

  const userId = session.user.id;
  const { selectedGameId } = req.body;

  console.log("UserID:", userId, "GameID:", selectedGameId);

  try {
    if (!mongoose.Types.ObjectId.isValid(selectedGameId)) {
      console.log("Ungültige GameID:", selectedGameId);
      throw new Error("Ungültige GameID");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Ungültige UserID:", userId);
      throw new Error("Ungültige UserID");
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    const newGameId = new mongoose.Types.ObjectId(selectedGameId);

    // Update durchführen
    const updatedUser = await User.findOneAndUpdate(
      { _id: userObjId },
      { $set: { chosengame: newGameId } },
      { new: true, runValidators: true }
    ).lean();

    console.log("Updated User Document:", updatedUser);

    if (!updatedUser) {
      console.log("Kein User gefunden mit ID:", userId);
      return res.status(404).json({ message: "User nicht gefunden" });
    }

    if (!updatedUser.chosengame) {
      console.log("Feld 'chosengame' wurde nicht aktualisiert.");
    } else {
      console.log("Feld 'chosengame' wurde gesetzt auf:", updatedUser.chosengame);
    }

    return res.status(200).json({ message: "Game changed", game: updatedUser.chosengame });
  } catch (error) {
    console.error("Fehler beim Ändern des Spiels:", error);
    return res.status(500).json({ message: "Fehler beim Ändern des Spiels", error: error.message });
  }
}
