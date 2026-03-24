import mongoose from "mongoose";

const quizSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
      },
    ],
    answers: [
      {
        questionIndex: Number,
        selectedIndex: Number,
        isCorrect: Boolean,
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    weakTopics: [{ type: String }],
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

quizSessionSchema.index({ user: 1, lesson: 1, status: 1 });

export default mongoose.model("QuizSession", quizSessionSchema);
