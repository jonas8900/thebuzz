import dbConnect from "../../db/connect";
import User from "../../db/models/User";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { normalizeEmail } from "@/lib/normalizeInput";
import { getClientIpFromReq } from "@/lib/hashIp";

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 5,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Methode nicht erlaubt" });
  }

  const ip = getClientIpFromReq(req);
  try {
    await rateLimiter.consume(ip);
  } catch {
    return res.status(429).json({
      error: "Zu viele Registrierungsversuche. Bitte warte 5 Minuten und versuche es erneut.",
    });
  }

  const rawEmail = req.body?.email || "";
  const email = normalizeEmail(rawEmail);
  const password = req.body?.password || "";
  const name = req.body?.name?.trim() || "";
  const username = req.body?.username?.trim() || "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Bitte gib eine gültige E-Mail-Adresse ein." });
  }

  if (!name || !username) {
    return res.status(400).json({ error: "Name und Benutzername sind erforderlich." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Das Passwort muss mindestens 8 Zeichen lang sein." });
  }

  const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/;
  const numberRegex = /\d/;
  if (!specialCharacterRegex.test(password) || !numberRegex.test(password)) {
    return res.status(400).json({
      error: "Das Passwort muss mindestens eine Zahl und ein Sonderzeichen enthalten.",
    });
  }

  await dbConnect();

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).lean();

    if (existingUser) {
      const conflictField =
        existingUser.email === email ? "dieser E-Mail-Adresse" : "diesem Benutzernamen";
      return res.status(400).json({
        error: `Ein Account mit ${conflictField} existiert bereits.`,
      });
    }

    const newUser = new User({ email, password, name, username });
    await newUser.save();

    return res.status(201).json({ message: "Registrierung erfolgreich!" });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Interner Serverfehler bei der Registrierung." });
  }
}
