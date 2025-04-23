import mongoose from "mongoose";

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
    createdAt: { type: Date, default: Date.now },
});

gameSchema.index({ players: 1 });
gameSchema.index({ admin: 1 });
gameSchema.index({ questions: 1 });
gameSchema.index({ scores: 1 });

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;
