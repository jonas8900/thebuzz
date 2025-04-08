import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {type: String, required: [true, "E-Mail ist erforderlich"], unique: true, lowercase: true, trim: true},
    password: {type: String, required: [true, "Passwort ist erforderlich"], minlength: 8},
    role: {type: String, enum: ["user", "admin"], default: "user",},
    name: {type: String, required: [true, "Name ist erforderlich"], trim: true},
    username: {type: String, required: [true, "Benutzername ist erforderlich"], unique: true, trim: true},
    yourgames: [{type: Schema.Types.ObjectId, ref: "Game"}],
    chosengame: {type: Schema.Types.ObjectId, ref: "Game"},
    createdAt: {type: Date, default: Date.now},
});

userSchema.pre("save", async function(next) {
    const user = this;
    if (!user.isModified("password")) return next();
    user.password = await bcrypt.hash(user.password, 10);
    next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}


userSchema.index({ chosengame: 1 });
userSchema.index({ yourgames: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
