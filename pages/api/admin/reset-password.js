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
    return res.status(400).json({ message: "Token und neues Passwort sind erforderlich" });
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token ungültig oder abgelaufen" });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined; 
    user.passwordResetExpires = undefined; 
    await user.save();

    res.status(200).json({ message: "Passwort erfolgreich geändert" });
  } catch (error) {
    console.error("Fehler beim Zurücksetzen des Passworts:", error);
    return res.status(500).json({ message: "Fehler beim Zurücksetzen des Passworts" });
  }
}
