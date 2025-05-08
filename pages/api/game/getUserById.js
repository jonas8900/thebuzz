import { getServerSession } from "next-auth";
import dbConnect from "../../../db/connect";
import Temporaryuser from "../../../db/models/Temporaryuser";
import User from "../../../db/models/User";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || session.user.isGuest) {
        return res.status(403).json({ message: "No access" });
    }

    await dbConnect();
    
    const { id } = req.query;
    
    try {
        let user = await Temporaryuser.findById(id);
        
        if (!user) {
            user = await User.findById(id);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    
        // Erfolgreich den User gefunden, sende die Antwort zurück
        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Error fetching user" });
    }
}
