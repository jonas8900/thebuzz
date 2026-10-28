import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Game from "../../../db/models/Game";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { normalizeEmail } from "@/lib/normalizeInput";
import { getClientIpFromReq } from "@/lib/hashIp";
import { createMailTransporter } from "@/lib/mailer";
import { requireAdminSession } from "@/lib/authGuard";

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60 * 5,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ip = getClientIpFromReq(req);

  try {
    await rateLimiter.consume(ip);
  } catch {
    return res.status(429).json({
      error: "Zu viele Einladungen in kurzer Zeit. Bitte warte 5 Minuten und versuche es erneut.",
    });
  }

  await dbConnect();

  const session = await requireAdminSession(req, res);
  if (!session) return;

  const sendUser = session.user.username;
  const rawEmail = req.body?.email || "";
  const email = normalizeEmail(rawEmail);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
  }

  // Load the invite link directly from the admin's active game in the database to prevent open-relay link injection
  const adminUser = await User.findById(session.user.id).select("chosengame").lean();
  const chosenGame = adminUser?.chosengame
    ? await Game.findOne({ _id: adminUser.chosengame, admin: session.user.id })
        .select("invitelink")
        .lean()
    : null;

  const verifiedInviteLink = chosenGame?.invitelink;
  if (!verifiedInviteLink) {
    return res.status(400).json({
      error: "Bitte generiere zuerst einen Einladungslink für dein ausgewähltes Spiel.",
    });
  }

  const transporter = createMailTransporter();

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `TheBuzz – Einladung zu einem Spiel von ${sendUser}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333333;">Hey!</h2>
            <p style="color: #555555;">Du wurdest von <strong>${sendUser}</strong> zu einer Runde TheBuzz eingeladen. Klicke auf den folgenden Link, um dem Spiel beizutreten:</p>
            <p style="color: #555555; font-size: 16px;">
              <a href="${verifiedInviteLink}" style="color: #007bff; text-decoration: none;">${verifiedInviteLink}</a>
            </p>
            <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #888888;">
              <p>© ${new Date().getFullYear()} TheBuzz</p>
            </footer>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Einladung wurde erfolgreich gesendet!" });
  } catch (error) {
    console.error("Error sending game invitation email:", error);
    return res.status(500).json({ error: "Es gab ein Problem beim Senden der Einladung." });
  }
}
