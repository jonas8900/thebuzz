import dbConnect from "@/db/connect";
import Task from "@/db/models/Task";
import User from "@/db/models/User";
import Temporaryuser from "@/db/models/Temporaryuser";
import Game from "@/db/models/Game";

// Server-side in-memory cache to prevent repeated collection scans on homepage visits
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let statsCache = {
  data: null,
  expiresAt: 0,
  pendingPromise: null,
};

async function computeStats() {
  await dbConnect();

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    totalAdmins,
    totalTempUsers,
    totalTasks,
    totalGames,
    playedByFinishedFlag,
    playedByScores,
    playedByStarted,
    newAdmins7d,
    newTempUsers7d,
    newTasks7d,
    newGames7d,
  ] = await Promise.all([
    User.estimatedDocumentCount(),
    Temporaryuser.estimatedDocumentCount(),
    Task.estimatedDocumentCount(),
    Game.estimatedDocumentCount(),
    Game.countDocuments({ finished: true }),
    Game.countDocuments({ "scores.0": { $exists: true } }),
    Game.countDocuments({ started: true }),
    User.countDocuments({ createdAt: { $gte: since } }),
    Temporaryuser.countDocuments({ createdAt: { $gte: since } }),
    Task.countDocuments({ createdAt: { $gte: since } }),
    Game.countDocuments({ createdAt: { $gte: since } }),
  ]);

  const playedGames = Math.max(playedByFinishedFlag, playedByScores, playedByStarted, 0);

  return {
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
    meta: {
      playedByStatus: playedByFinishedFlag,
      playedByScores,
      playedByStarted,
      cachedAt: new Date().toISOString(),
    },
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const now = Date.now();

    if (statsCache.data && now < statsCache.expiresAt) {
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
      return res.status(200).json({ ok: true, data: statsCache.data, cached: true });
    }

    // Deduplicate concurrent requests while cache is refreshing (stampede protection)
    if (!statsCache.pendingPromise) {
      statsCache.pendingPromise = computeStats()
        .then((freshData) => {
          statsCache.data = freshData;
          statsCache.expiresAt = Date.now() + CACHE_TTL_MS;
          return freshData;
        })
        .finally(() => {
          statsCache.pendingPromise = null;
        });
    }

    const data = await statsCache.pendingPromise;

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json({ ok: true, data, cached: false });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    return res.status(500).json({ ok: false, error: "Interner Serverfehler" });
  }
}
