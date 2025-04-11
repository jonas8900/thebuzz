import crypto from "crypto";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
    points: 10, 
    duration: 60 * 5, 
});


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  try {
    await rateLimiter.consume(ip);
  } catch (rateLimiterRes) {
    return res.status(429).json({ error: "Zu viele Anfragen. Dein Account wurde für 5 Minuten gesperrt. Bitte versuche es später erneut." });
  }

  await dbConnect();

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "E-Mail ist erforderlich" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden" });

    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`;

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
      subject: "Ankerquiz - Passwort zurücksetzen",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
              <h2 style="color: #333333;">Passwort zurücksetzen</h2>
              <p style="color: #555555;">Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
              <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a>
              <p style="margin-top: 15px; color: #999;">Der Link ist 1 Stunde lang gültig.</p>
            </div>
          </body>
        </html>`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "E-Mail zum Zurücksetzen des Passworts gesendet" });
  } catch (error) {
    console.error("Fehler beim Senden der Reset-Mail:", error);
    return res.status(500).json({ message: "Fehler beim Zurücksetzen des Passworts" });
  }
}
