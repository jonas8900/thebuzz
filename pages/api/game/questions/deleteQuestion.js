import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import Game from "../../../../db/models/Game";
import dbConnect from "../../../../db/connect";
import Task from "../../../../db/models/Task";




export default async function handler(req, res) {

  if (req.method !== "POST") {
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

    const question = await Task.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({ message: "Frage nicht gefunden" });
    }

    return res.status(200).json({ message: "Frage gelöscht"});
  } catch (error) {
    console.error("Fehler beim löschen der Frage:", error);
    return res.status(500).json({ message: "Fehler beim löschen der Frage", error: error.message });
  }
}