import crypto from "crypto";
import Task from "../../../../db/models/Task";
import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";
import formidable from "formidable";
import AWS from "aws-sdk";
import fs from "fs";
import { requireAdminSession } from "@/lib/authGuard";

AWS.config.update({
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
]);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await requireAdminSession(req, res);
  if (!session) return;

  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10 MB
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE" || err.code === 1009) {
        return res.status(400).json({
          message: "Die Datei ist zu groß. Maximal 10 MB sind erlaubt.",
          error: "Die Datei ist zu groß. Maximal 10 MB sind erlaubt.",
        });
      }
      console.error("Form parse error:", err);
      return res.status(400).json({
        message: "Fehler beim Verarbeiten der Formulardaten.",
        error: "Fehler beim Verarbeiten der Formulardaten.",
      });
    }

    const gameId = Array.isArray(fields.gameId) ? fields.gameId[0] : fields.gameId;
    const question = Array.isArray(fields.question) ? fields.question[0] : fields.question;
    const correctanswer = Array.isArray(fields.correctanswer)
      ? fields.correctanswer[0]
      : fields.correctanswer;
    const mode = Array.isArray(fields.mode) ? fields.mode[0] : fields.mode;
    const points = Array.isArray(fields.points)
      ? Number(fields.points[0])
      : Number(fields.points);
    const pointsgiven = Array.isArray(fields.pointsgiven)
      ? fields.pointsgiven[0] === "true"
      : Boolean(fields.pointsgiven);

    // Verify that the authenticated admin owns the target game
    const targetGame = await Game.findOne({ _id: gameId, admin: session.user.id });
    if (!targetGame) {
      return res.status(403).json({
        message: "Keine Berechtigung für dieses Spiel.",
        error: "Keine Berechtigung für dieses Spiel.",
      });
    }

    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!file || !file.filepath) {
      return res.status(400).json({
        message: "Bitte wähle ein Bild zum Hochladen aus.",
        error: "Bitte wähle ein Bild zum Hochladen aus.",
      });
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      fs.unlink(file.filepath, () => {});
      return res.status(400).json({
        message: "Ungültiges Bildformat. Erlaubt sind JPG, PNG, WebP und GIF.",
        error: "Ungültiges Bildformat. Erlaubt sind JPG, PNG, WebP und GIF.",
      });
    }

    if (!fs.existsSync(file.filepath) || fs.statSync(file.filepath).size === 0) {
      return res.status(400).json({
        message: "Die hochgeladene Datei ist leer.",
        error: "Die hochgeladene Datei ist leer.",
      });
    }

    const fileStream = fs.createReadStream(file.filepath);
    const safeRandomKey = `games/${Date.now()}-${crypto.randomUUID()}.webp`;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: safeRandomKey,
      Body: fileStream,
      ContentType: file.mimetype || "image/webp",
      CacheControl: "public, max-age=31536000",
    };

    try {
      const data = await s3.upload(uploadParams).promise();

      const newQuestion = await Task.create({
        question,
        correctanswer,
        mode,
        gameId,
        file: data.Location,
        points,
        pointsgiven,
      });

      const updatedGame = await Game.findByIdAndUpdate(
        gameId,
        { $push: { questions: newQuestion._id } },
        { new: true }
      );

      fs.unlink(file.filepath, () => {});

      return res.status(201).json({
        message: "Bilderfrage erfolgreich erstellt! 🎉",
        game: updatedGame,
        question: newQuestion,
      });
    } catch (error) {
      fs.unlink(file.filepath, () => {});
      console.error("Error uploading image to S3:", error);
      return res.status(500).json({
        message: "Fehler beim Hochladen des Bildes.",
        error: "Fehler beim Hochladen des Bildes.",
      });
    }
  });
}
