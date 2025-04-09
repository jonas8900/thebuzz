import mongoose from "mongoose";

const { Schema } = mongoose;

const taskSchema = new Schema({
  task: { type: String, required: true },
  answer: { type: String, required: true },
  mode: { type: String, required: true },
  gameId: { type: String, required: true },
  points: { type: Number, required: true },
  
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;
