import mongoose from "mongoose";

const { Schema } = mongoose;

const temporaryuserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Benutzername ist erforderlich"],
    trim: true,
  },
  yourgame: {
    type: Schema.Types.ObjectId,
    required: [true, "Spiel-ID ist erforderlich"],
    ref: "Game",
  },
  points: { type: Number, default: 0 },
  finalscore: { type: Boolean, default: false },
  ipHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Ensure usernames only need to be unique within the same game
temporaryuserSchema.index({ username: 1, yourgame: 1 }, { unique: true });
temporaryuserSchema.index({ yourgame: 1 });
temporaryuserSchema.index({ points: 1 });
temporaryuserSchema.index({ finalscore: 1 });
temporaryuserSchema.index({ createdAt: 1 });

const Temporaryuser =
  mongoose.models.Temporaryuser || mongoose.model("Temporaryuser", temporaryuserSchema);

export default Temporaryuser;
