import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Game from "../../../db/models/Game";
import Temporaryuser from "../../../db/models/Temporaryuser";
import Task from "../../../db/models/Task";
import AWS from "aws-sdk";

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

  const session = await getServerSession(req, res, authOptions); 
  
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  const { gameId } = req.body;

  try {
   
    const deletedGame = await Game.findByIdAndDelete(gameId);

    const temporaryUser = await Temporaryuser.deleteMany({yourgame: gameId});

    const questions = await Task.find({gameId: gameId});

    if (questions.length > 0) {
      for (const question of questions) {
        if(question.mode === "picture" && question.file) {
          const fileName = question.file.split('/').pop(); 

          const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `games/${fileName}`,
          };

          try {
            await s3.deleteObject(deleteParams).promise();
            const questionDelete = await Task.findByIdAndDelete(question._id);
            console.log("Datei erfolgreich aus S3 gelöscht:", fileName);
            console.log("Frage gelöscht:", questionDelete);
          } catch (error) {
            console.error("Fehler beim Löschen der Datei aus S3:", error);
            return res.status(500).json({ error: "Fehler beim Löschen der Datei aus S3." });
          }
          
        } else {
         const questionDelete = await Task.findByIdAndDelete(question._id);
          if (!questionDelete) {
            return res.status(404).json({ message: "Frage nicht gefunden" });
          }
          console.log("Frage erfolgreich gelöscht:", question._id);
        }
      }
    }


    if (!deletedGame) {
      return res.status(404).json({ message: "Game not found" });
    }

    await User.updateMany(
        { yourgames: gameId }, 
        { $pull: { yourgames: gameId } } 
      );

    return res.status(201).json({ message: "Game deleted", game: deletedGame, temporaryUser, questions });
  } catch (error) {
    console.error("Fehler beim Erstellen des Spiels:", error);
    return res.status(500).json({ message: "Fehler beim Erstellen des Spiels", error: error.message });
  }
}