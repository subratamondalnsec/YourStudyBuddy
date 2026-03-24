import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    courseName: { type: String, default: "Course" },
    activityType: {
      type: String,
      enum: ["COURSE_STARTED", "LESSON_COMPLETED", "QUIZ_STARTED", "QUIZ_ATTEMPTED"],
      required: true,
    },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

activitySchema.index({ user: 1, timestamp: -1 });

export default mongoose.model("Activity", activitySchema);
