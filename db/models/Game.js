import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const gameSchema = new Schema({

    name: { type: String, required: true },
    admin: { type: Schema.Types.ObjectId, ref: "User" },
    players: [{
        playerId: { type: Schema.Types.ObjectId, ref: "Temporaryuser" },
        username: { type: String, required: true }
    }],
    gamemode: { type: String, enum: ["random", "buzzergame", "lowtohigh", 'sorted'], default: "random" },
    currentplayer: [{ type: Schema.Types.ObjectId, ref: "User" }],
    questions: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    invitelink: { type: String },
    scores: [{
        date: { type: Date, default: Date.now },
        results: [{
          player: { type: Schema.Types.ObjectId, ref: "Temporaryuser" },
          points: { type: Number, default: 0 }
        }]
      }],
    files: [{ type: String }],
    started: { type: Boolean, default: false, required: true },
    joinstopped: { type: Boolean, default: false },
    currentQuestionIndex: { type: Number, default: 0 },
    finished: { type: Boolean, default: false },
    blockedips: [{ type: String }],
    blockedusers: [{
      user: { type: Schema.Types.ObjectId, ref: "Temporaryuser" },
      blockedip: { type: String }
    }],    
    createdAt: { type: Date, default: Date.now },
});



function normalizeIp(ip) {
  if (ip === "::1") return "127.0.0.1";
  if (ip?.startsWith("::ffff:")) return ip.split(":").pop();
  return ip;
}

function isHashed(ip) {
  return /^[a-f0-9]{64}$/.test(ip);
}

gameSchema.pre("save", function (next) {
  if (this.isModified("blockedips")) {
    this.blockedips = this.blockedips.map(ip => {
      const normalizedIp = normalizeIp(ip);
      return isHashed(normalizedIp)
        ? normalizedIp
        : crypto.createHash("sha256").update(normalizedIp).digest("hex");
    });
  }

  if (this.isModified("blockedusers")) {
    this.blockedusers = this.blockedusers.map(entry => {
      const normalizedIp = normalizeIp(entry.blockedip);
      const hashedIp = isHashed(normalizedIp)
        ? normalizedIp
        : crypto.createHash("sha256").update(normalizedIp).digest("hex");
      return {
        ...entry,
        blockedip: hashedIp
      };
    });
  }

  next();
});








gameSchema.index({ players: 1 });
gameSchema.index({ admin: 1 });
gameSchema.index({ questions: 1 });
gameSchema.index({ scores: 1 });

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;
