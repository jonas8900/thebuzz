import mongoose from "mongoose";

const { Schema } = mongoose;

const taskSchema = new Schema({
  question: { type: String, required: true },
  correctanswer: { type: String, required: true },
  answers: { type: [String], required: false },
  playeranswers: [
    {
      playerId: {type: mongoose.Schema.Types.ObjectId, ref: "Temporaryuser", required: false},
      username: { type: String, required: false },
      answer: { type: String, required: false },
    }
  ],
  mode: { type: String, required: true },
  gameId: { type: String, required: true },
  points: { type: Number, required: true },
  file: { type: String },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
