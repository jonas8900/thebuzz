import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema({
    email: {type: String, required: [true, "E-Mail ist erforderlich"], unique: true, lowercase: true, trim: true},
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    password: {
    type: String,
    select: false,
    required: function () { return this.provider === "credentials"; },
    validate: {
      validator: function (v) {
        if (this.provider !== "credentials") return true;     
        return typeof v === "string" && v.length >= 8;        
      },
      message: "Passwort ist erforderlich und muss mind. 8 Zeichen haben.",
    },
  },
    role: {type: String, enum: ["user", "admin"], default: "user",},
    name: {type: String, required: [true, "Name ist erforderlich"], trim: true},
    username: {type: String, required: [true, "Benutzername ist erforderlich"], unique: true, trim: true},
    yourgames: [{type: Schema.Types.ObjectId, ref: "Game"}],
    chosengame: {type: Schema.Types.ObjectId, ref: "Game"},
    createdAt: {type: Date, default: Date.now},
    passwordResetToken: {type: String, default: null},
    passwordResetExpires: {type: Date, default: null},
});

userSchema.pre("save", async function (next) {
  try {
    if (this.provider !== "credentials") return next();
    if (!this.isModified("password") || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.provider !== "credentials") return false;

  let hash = this.password;
  if (!hash) {
    const fresh = await this.constructor.findById(this._id).select("+password");
    hash = fresh?.password;
  }
  if (!hash) return false; 
  return bcrypt.compare(candidatePassword, hash);
};


userSchema.index({ chosengame: 1 });
userSchema.index({ yourgames: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

