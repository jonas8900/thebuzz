import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";
import Task from "../../../../db/models/Task";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req, res) {

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const session = await getServerSession(req, res, authOptions); 
  
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  const { id } = req.body;

  console.log(id);

  try {

    const question = await Task.findById(id);

    if (!question) {
      return res.status(404).json({ message: "Frage nicht gefunden" });
    }

    if (question.mode === "picture" && question.file) {
      const fileName = question.file.split('/').pop(); 

      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `games/${fileName}`,
      };

      try {
        await s3.deleteObject(deleteParams).promise();
        console.log("Datei erfolgreich aus S3 gelöscht:", fileName);
      } catch (error) {
        console.error("Fehler beim Löschen der Datei aus S3:", error);
        return res.status(500).json({ error: "Fehler beim Löschen der Datei aus S3." });
      }
    }

    const game = await Game.findById(question.gameId);
    console.log(game);

    if (game) {
      game.questions = game.questions.filter((questionId) => questionId.toString() !== id.toString());
      await game.save();
    }

    const questionDelete = await Task.findByIdAndDelete(id);


    return res.status(200).json({ message: "Frage erfolgreich gelöscht" });
  } catch (error) {
    console.error("Fehler beim Löschen der Frage:", error);
    return res.status(500).json({ message: "Fehler beim Löschen der Frage", error: error.message });
  }
}
