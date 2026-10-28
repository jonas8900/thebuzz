import Game from "../../../db/models/Game";
import dbConnect from "../../../db/connect";
import { requireGameOwner } from "@/lib/authGuard";

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;
  const auth = await requireGameOwner(req, res, id);
  if (!auth) return;

  if (req.method === "POST") {
    try {
      const rawBase =
        process.env.COPYLINK_URL || process.env.NEXT_PUBLIC_SERVER_URL || "";
      const baseUrl = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;
      const randomToken = Math.random().toString(36).substring(2, 16);
      const newInviteLink = `${baseUrl}game?code=${randomToken}&x=${id}`;

      const game = await Game.findByIdAndUpdate(
        id,
        { invitelink: newInviteLink },
        { new: true }
      );

      return res.status(200).json(game);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === "GET") {
    try {
      const game = await Game.findById(id).select("invitelink players").lean();
      return res.status(200).json(game);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: "Methode nicht erlaubt" });
}
