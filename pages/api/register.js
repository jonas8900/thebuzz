
import dbConnect from "../../db/connect";
import User from "../../db/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }


  const { email, password, name, username } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: "E-Mail und Passwort sind erforderlich" });
  }

  await dbConnect(); 

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Ein Benutzer mit dieser E-Mail existiert bereits." });
    }

    const newUser = new User({ email, password, name, username });
    await newUser.save();
  
      return res.status(201).json({ message: "Benutzer erstellt & E-Mail gesendet!" });
  } catch (error) {
    res.status(500).json({ error: "Interner Serverfehler" });
  }
}
