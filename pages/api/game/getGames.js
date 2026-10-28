import dbConnect from "../../../db/connect";
import Game from "../../../db/models/Game";
import { requireAdminSession } from "@/lib/authGuard";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Methode nicht erlaubt" });
  }

  await dbConnect();

  const session = await requireAdminSession(req, res);
  if (!session) return;

  try {
    const games = await Game.find({ admin: session.user.id })
      .select("_id name")
      .lean();

    return res.status(200).json(games);
  } catch (error) {
    console.error("Error fetching admin games:", error);
    return res.status(500).json({ error: error.message });
  }
}
