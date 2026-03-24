import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    quizSession: { type: mongoose.Schema.Types.ObjectId, ref: "QuizSession" },
    questionId: { type: String, required: true },
    topic: { type: String, default: "General" },
    isCorrect: { type: Boolean, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ user: 1, timestamp: -1 });
quizAttemptSchema.index({ user: 1, topic: 1 });

export default mongoose.model("QuizAttempt", quizAttemptSchema);
