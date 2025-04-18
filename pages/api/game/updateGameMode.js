import Game from "../../../db/models/Game";
import dbConnect from "../../../db/connect"; // falls du sowas hast
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {

    if (req.method !== "PATCH") return res.status(405).end();

    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
        return res.status(403).json({ message: "No access" });
    }

    const { gameId, gamemode } = req.body;

    try {
        await dbConnect(); 
        const game = await Game.findByIdAndUpdate(gameId, { gamemode }, { new: true });

        if (!game) return res.status(404).json({ message: "Game not found" });

        res.status(200).json({ message: "Gamemode updated", game });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
