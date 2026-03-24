import mongoose from "mongoose";

const studyScheduleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    weakTopics: [{ type: String }],
    availableTime: { type: Number, default: 60 },
    schedule: [
      {
        topic: String,
        time: Number,
        priority: { type: String, enum: ["high", "medium", "low"] },
      },
    ],
    plan: [
      {
        day: String,
        focusTopics: [String],
        tasks: [String],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("StudySchedule", studyScheduleSchema);
