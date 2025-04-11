import mongoose from "mongoose";


const { Schema } = mongoose;

const temporaryuserSchema = new Schema({
    username: {type: String, required: [true, "Benutzername ist erforderlich"], unique: true, trim: true},
    yourgame: {type: Schema.Types.ObjectId, required: [true, "Spiel-ID ist erforderlich"],  ref: "Game", },
    points: {type: Number, default: 0},
    createdAt: {type: Date, default: Date.now},
});



const Temporaryuser = mongoose.models.Temporaryuser || mongoose.model("Temporaryuser", temporaryuserSchema);

export default Temporaryuser;
