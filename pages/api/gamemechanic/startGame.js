
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Game from "../../../db/models/Game";
import dbConnect from "../../../db/connect";

export default async function handler(req, res) {

    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        return res.status(403).json({ message: "No access" });
    }


    await dbConnect();

    if (req.method === "PUT") {
        const { id } = req.query;

        try {
        const game = await Game.findByIdAndUpdate(id, { started: true }, { new: true });
        if (!game) return res.status(404).json({ message: "Game not found" });

        res.status(200).json(game);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Fehler beim Starten des Spiels" });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
