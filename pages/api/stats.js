// pages/api/stats.js
import dbConnect from "@/db/connect"; // Pfad anpassen
import Task from "@/db/models/Task";
import User from "@/db/models/User";
import Temporaryuser from "@/db/models/Temporaryuser";
import Game from "@/db/models/Game";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  try {
    await dbConnect();

    const [totalAdmins, totalTempUsers, totalTasks, totalGames] = await Promise.all([
      User.estimatedDocumentCount(),
      Temporaryuser.estimatedDocumentCount(),
      Task.estimatedDocumentCount(),
      Game.estimatedDocumentCount(),
    ]);

    const playedByStatus = await Game.countDocuments({ status: "finished" });

    const playedByScores = await Game.countDocuments({ "scores.0": { $exists: true } });

    const playedByStarted = await Game.countDocuments({ started: true });

    const playedGames =
      playedByStatus || playedByScores || playedByStarted || 0;

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [newAdmins7d, newTempUsers7d, newTasks7d, newGames7d] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: since } }),
      Temporaryuser.countDocuments({ createdAt: { $gte: since } }),
      Task.countDocuments({ createdAt: { $gte: since } }),
      Game.countDocuments({ createdAt: { $gte: since } }),
    ]);

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=30, stale-while-revalidate=60"
    );

    return res.status(200).json({
      ok: true,
      data: {
        totals: {
          admins: totalAdmins,
          tempUsers: totalTempUsers,
          tasks: totalTasks,
          games: totalGames,
          playedGames,
        },
        last7d: {
          admins: newAdmins7d,
          tempUsers: newTempUsers7d,
          tasks: newTasks7d,
          games: newGames7d,
        },
        meta: { playedByStatus, playedByScores, playedByStarted },
      },
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return res.status(500).json({ ok: false, error: "Internal Server Error" });
  }
}
