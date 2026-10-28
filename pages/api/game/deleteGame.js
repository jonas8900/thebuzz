import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Game from "../../../db/models/Game";
import Temporaryuser from "../../../db/models/Temporaryuser";
import Task from "../../../db/models/Task";
import AWS from "aws-sdk";
import { requireGameOwner } from "@/lib/authGuard";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { gameId } = req.body;
  const auth = await requireGameOwner(req, res, gameId);
  if (!auth) return;

  try {
    const questions = await Task.find({ gameId }).lean();

    // Remove associated S3 images for picture questions
    for (const question of questions) {
      if (question.mode === "picture" && question.file) {
        const fileName = question.file.split("/").pop();
        if (fileName && process.env.AWS_S3_BUCKET_NAME) {
          try {
            await s3
              .deleteObject({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `games/${fileName}`,
              })
              .promise();
          } catch (s3Error) {
            console.error("Error deleting file from S3:", s3Error);
          }
        }
      }
    }

    const [deletedGame, temporaryUser] = await Promise.all([
      Game.findByIdAndDelete(gameId),
      Temporaryuser.deleteMany({ yourgame: gameId }),
      Task.deleteMany({ gameId }),
    ]);

    await User.updateMany(
      { yourgames: gameId },
      { $pull: { yourgames: gameId } }
    );

    // If the deleted game was the admin's currently selected game, select the next available game
    const adminUser = await User.findById(auth.session.user.id);
    if (adminUser && String(adminUser.chosengame) === String(gameId)) {
      const fallbackGame = await Game.findOne({ admin: auth.session.user.id })
        .select("_id")
        .lean();
      adminUser.chosengame = fallbackGame ? fallbackGame._id : null;
      await adminUser.save();
    }

    return res.status(200).json({
      message: "Spiel erfolgreich gelöscht",
      game: deletedGame,
      temporaryUser,
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    return res.status(500).json({
      message: "Fehler beim Löschen des Spiels",
      error: error.message,
    });
  }
}
