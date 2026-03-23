import mongoose from "mongoose";
import bcrype from "bcrypt";
import jwt from "jsonwebtoken";



const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    authProvider: { type: String, default: 'local' },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    tier: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },  
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    subjects: [
      {
        type:String
      },
    ],
    summerySubjects: [
      {
        type: String,
      },
    ],
    summaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Summary",
      },
    ],
    notes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],
    flashcardGroups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlashcardGroup",
      },
    ],
    Quizes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrype.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrype.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
