import { getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import Game from "../db/models/Game";
import mongoose from "mongoose";

/**
 * Verifies that the request is made by an authenticated non-guest user.
 * Returns the session or sends an HTTP 403 response and returns null.
 */
export async function requireAdminSession(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id || session.user.isGuest) {
    res.status(403).json({ message: "Keine Berechtigung", error: "Keine Berechtigung" });
    return null;
  }
  return session;
}

/**
 * Verifies that the authenticated user is the owner (admin) of the specified game.
 * Returns { session, game } or sends an appropriate HTTP error response and returns null.
 */
export async function requireGameOwner(req, res, gameId) {
  const session = await requireAdminSession(req, res);
  if (!session) return null;

  if (!gameId || !mongoose.Types.ObjectId.isValid(gameId)) {
    res.status(400).json({ message: "Ungültige Spiel-ID", error: "Ungültige Spiel-ID" });
    return null;
  }

  const game = await Game.findById(gameId);
  if (!game) {
    res.status(404).json({ message: "Spiel nicht gefunden", error: "Spiel nicht gefunden" });
    return null;
  }

  if (game.admin?.toString() !== session.user.id.toString()) {
    res.status(403).json({
      message: "Nur der Spielleiter darf diese Aktion ausführen",
      error: "Nur der Spielleiter darf diese Aktion ausführen",
    });
    return null;
  }

  return { session, game };
}
