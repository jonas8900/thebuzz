import { keepAliveDatabase } from "@/db/connect";

/**
 * Health check and MongoDB keep-alive endpoint.
 * Used by Coolify/Heroku health probes and scheduled cron jobs to prevent
 * MongoDB Atlas free-tier clusters from auto-pausing due to inactivity.
 */
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  try {
    const dbStatus = await keepAliveDatabase();

    return res.status(200).json({
      ok: true,
      status: "healthy",
      db: "connected",
      latencyMs: dbStatus.latencyMs,
      timestamp: dbStatus.timestamp,
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return res.status(503).json({
      ok: false,
      status: "unhealthy",
      db: "disconnected",
      error: "Database ping failed",
      timestamp: new Date().toISOString(),
    });
  }
}
