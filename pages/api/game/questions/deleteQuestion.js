import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";
import Task from "../../../../db/models/Task";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { requireAdminSession } from "@/lib/authGuard";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await requireAdminSession(req, res);
  if (!session) return;

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Frage-ID fehlt." });
  }

  try {
    const question = await Task.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Frage nicht gefunden." });
    }

    const game = await Game.findById(question.gameId);
    if (game && game.admin?.toString() !== session.user.id.toString()) {
      return res.status(403).json({
        message: "Nur der Spielleiter darf Fragen aus diesem Spiel löschen.",
      });
    }

    if (question.mode === "picture" && question.file) {
      const fileName = question.file.split("/").pop();
      if (fileName && process.env.AWS_S3_BUCKET_NAME) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: `games/${fileName}`,
            })
          );
        } catch (error) {
          console.error("Error deleting image from S3:", error);
          return res.status(500).json({ error: "Fehler beim Löschen des Bildes aus S3." });
        }
      }
    }

    if (game) {
      game.questions = game.questions.filter(
        (questionId) => questionId.toString() !== id.toString()
      );
      await game.save();
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({ message: "Frage erfolgreich gelöscht." });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res.status(500).json({
      message: "Fehler beim Löschen der Frage.",
      error: error.message,
    });
  }
}
