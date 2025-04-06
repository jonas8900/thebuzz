import mongoose from "mongoose";

const { Schema } = mongoose;

const gameSchema = new Schema({

    name: { type: String, required: true },
    admin: [{ type: Schema.Types.ObjectId, ref: "User" }],
    players: [{ type: Schema.Types.ObjectId, ref: "User" }],
    questions: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    invitelink: { type: String },
    scores: [{ player: { type: Schema.Types.ObjectId, ref: "User" }, points: { type: Number, default: 0 } }],
    files: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;
