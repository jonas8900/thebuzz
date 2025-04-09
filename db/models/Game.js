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
    gameOpenedBy: { type: Schema.Types.ObjectId, ref: "User" },
    started: { type: Boolean, default: false, required: true },
    finished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

gameSchema.index({ players: 1 });
gameSchema.index({ admin: 1 });
gameSchema.index({ questions: 1 });
gameSchema.index({ scores: 1 });

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;
