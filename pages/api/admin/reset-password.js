import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token und neues Passwort sind erforderlich." });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({
      message: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    });
  }

  const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`]/;
  const numberRegex = /\d/;
  if (!specialCharacterRegex.test(newPassword) || !numberRegex.test(newPassword)) {
    return res.status(400).json({
      message: "Das Passwort muss mindestens eine Zahl und ein Sonderzeichen enthalten.",
    });
  }

  const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");

  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Der Link ist ungültig oder abgelaufen." });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Passwort erfolgreich geändert." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Fehler beim Zurücksetzen des Passworts." });
  }
}
