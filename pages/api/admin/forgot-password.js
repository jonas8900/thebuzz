import crypto from "crypto";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { normalizeEmail } from "@/lib/normalizeInput";

function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  const ipFromXff = Array.isArray(xff) ? xff[0] : (xff?.split(",")[0] || "");
  return ipFromXff || req.socket?.remoteAddress || "unknown";
}

const rateLimiter = new RateLimiterMemory({
    points: 10, 
    duration: 60 * 5, 
});


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ip = getClientIp(req);

  try {
    await rateLimiter.consume(ip);
  } catch (rateLimiterRes) {
    return res.status(429).json({ error: "Zu viele Anfragen. Dein Account wurde für 5 Minuten gesperrt. Bitte versuche es später erneut." });
  }

  await dbConnect();

  const rawEmail = req.body?.email ?? "";
  const email = normalizeEmail(rawEmail);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(200).json({
      message:
        "Wenn ein Account existiert, wurde eine E-Mail zum Zurücksetzen gesendet.",
    });
  }

  

  try {
    const user = await User.findOne({ email }).select("_id provider");
    if (user && user.provider === "credentials") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
      const TTL_MS = 15 * 60 * 1000;

      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + TTL_MS;
      await user.save();

      const resetLink = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${rawToken}`;
      

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: "TheBuzz - Passwort zurücksetzen",
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
                <h2 style="color: #333333;">Passwort zurücksetzen</h2>
                <p style="color: #555555;">Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
                <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a>
                <p style="margin-top: 15px; color: #999;">Der Link ist 15 Minuten lang gültig.</p>
              </div>
            </body>
          </html>`,
      };

      await transporter.sendMail(mailOptions);
      
    }
    return res.status(200).json({
      message:
        "Wenn ein Account existiert, wurde eine E-Mail zum Zurücksetzen gesendet.",
    });
  } catch (error) {
     console.error("Fehler beim Zurücksetzen:", error);
    return res.status(200).json({
      message:
        "Wenn ein Account existiert, wurde eine E-Mail zum Zurücksetzen gesendet.",
    });
  }
}
