import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import Task from "../../../../db/models/Task";
import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";
import formidable from "formidable";
import AWS from "aws-sdk";
import fs from "fs";

AWS.config.update({
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

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

  const session = await getServerSession(req, res, authOptions); 
  
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  try {

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024,  
    });
    
    form.parse(req, async (err, fields, files) => {
        if (err) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "Die Datei ist zu groß. Bitte wählen Sie eine Datei, die kleiner als 3 MB ist." });
          }
          console.error(err);
          return res.status(400).json({ error: "Fehler beim Verarbeiten der Formulardaten." });
        }
      
        // Konvertiere Felder in den richtigen Datentyp
        const gameId = Array.isArray(fields.gameId) ? fields.gameId[0] : fields.gameId;
        const question = Array.isArray(fields.question) ? fields.question[0] : fields.question;
        const correctanswer = Array.isArray(fields.correctanswer) ? fields.correctanswer[0] : fields.correctanswer;
        const mode = Array.isArray(fields.mode) ? fields.mode[0] : fields.mode;
        const points = Array.isArray(fields.points) ? Number(fields.points[0]) : Number(fields.points);
        const pointsgiven = Array.isArray(fields.pointsgiven) ? fields.pointsgiven[0] === 'true' : fields.pointsgiven;
      
        console.log(gameId, question, correctanswer, mode, points, pointsgiven);
      
        const file = files.image?.[0];
      
        if (!file) {
          return res.status(400).json({ error: "Keine Datei hochgeladen." });
        }
      
        const filePath = file.filepath;
      
        if (!filePath) {
          return res.status(400).json({ error: "Der Dateipfad ist undefiniert." });
        }
      
        if (!fs.existsSync(filePath)) {
          return res.status(400).json({ error: "Dateipfad existiert nicht." });
        }
      
        const fileStats = fs.statSync(filePath);
        if (fileStats.size === 0) {
          return res.status(400).json({ error: "Datei ist leer." });
        }
      
        const fileStream = fs.createReadStream(filePath);
        fileStream.on("error", (err) => {
          console.error("File Stream Error:", err);
          return res.status(500).json({ error: "Fehler beim Lesen der Datei." });
        });
      
        const str = file.originalFilename;
        const newFilename = str.lastIndexOf(".") !== -1 ? str.slice(0, str.lastIndexOf(".")) + ".webp" : str + ".webp";
      
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `games/${Date.now()}-${newFilename}`,
          Body: fileStream,
          ContentType: file.mimetype || "application/octet-stream", 
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
      
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Fehler beim Löschen der Datei:", err);
            } else {
              console.log("Datei erfolgreich gelöscht:", filePath);
            }
          });
      
          return res.status(201).json({ message: "Frage erstellt", game: updatedGame, question: newQuestion });
        } catch (error) {
          console.error("Fehler beim Hochladen der Datei:", error);
          return res.status(500).json({ error: "Fehler beim Hochladen der Datei." });
        }
      });

  } catch (error) {
    console.error("Fehler beim Erstellen der Frage:", error);
    return res.status(500).json({ message: "Fehler beim Erstellen der Frage", error: error.message });
  }
}
