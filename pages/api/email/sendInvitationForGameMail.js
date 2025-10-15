import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../db/connect";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { normalizeEmail } from "@/lib/normalizeInput";

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

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(403).json({ message: "No access" });
  }

  const sendUser = session.user.username;
  const { email, inviteLink } = req.body;

  if (!inviteLink) {
    return res.status(400).json({ error: "Einladungslink fehlt." });
  }

  const emailRegex = normalizeEmail(email);
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
  }


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
    subject: `TheBuzz Einladung zu einem Spiel von ${sendUser}`, 
    html: `
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #333333;">Hey!</h2>
                    <p style="color: #555555;">Du wurdest zu einem Spiel eingeladen. Klicke auf den folgenden Link, um dem Spiel beizutreten:</p>
                    <p style="color: #555555; font-size: 16px;">
                        <a href="${inviteLink}" style="color: #007bff; text-decoration: none;">${inviteLink}</a>
                    </p>
                    <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #888888;">
                        <p>© 2025 Dein Spiel</p>
                    </footer>
                    </div>
                </body>
            </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Einladung wurde erfolgreich gesendet!" });
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail:", error);
    return res.status(500).json({ error: "Es gab ein Problem beim Senden der Einladung." });
  }
}
