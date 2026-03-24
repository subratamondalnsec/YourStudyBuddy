import StudySchedule from "../models/studySchedule.model.js";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { safeJsonParseFromGemini } from "../utils/functions.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import mongoose from "mongoose";

const buildSmartSchedule = (topics = [], availableTime = 60) => {
  const safeTopics = topics.length ? topics : ["General Revision"];

  const totalWeight = safeTopics.reduce((sum, _, index) => sum + (safeTopics.length - index), 0);

  return safeTopics.slice(0, 5).map((topic, index) => {
    const weight = safeTopics.length - index;
    const allocated = Math.max(10, Math.round((availableTime * weight) / totalWeight));

    let priority = "low";
    if (index === 0) priority = "high";
    else if (index < 3) priority = "medium";

    return {
      topic,
      time: allocated,
      priority,
    };
  });
};

const generateSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const { availableTime = 60, weakTopics = [] } = req.body;

    let effectiveWeakTopics = Array.isArray(weakTopics) ? weakTopics.filter(Boolean) : [];

    if (!effectiveWeakTopics.length) {
      const weakAreaDocs = await QuizAttempt.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
            isCorrect: false,
          },
        },
        {
          $group: {
            _id: "$topic",
            wrongCount: { $sum: 1 },
          },
        },
        { $sort: { wrongCount: -1 } },
        { $limit: 6 },
      ]);

      effectiveWeakTopics = weakAreaDocs.map((item) => item._id).filter(Boolean);
    }

    if (!effectiveWeakTopics.length) {
      effectiveWeakTopics = ["General Revision"];
    }

    const prompt = `Create a study schedule JSON for weak topics ${JSON.stringify(effectiveWeakTopics)} and ${availableTime} minutes per day. Return strict JSON shape: {"schedule":[{"topic":"Recursion","time":30,"priority":"high"}]}. Prioritize weakest topics first and distribute time proportionally.`;

    let schedule = [];

    try {
      const response = await callGeminiTextGenAPI(prompt);
      const parsed = safeJsonParseFromGemini(response);
      schedule = Array.isArray(parsed?.schedule) ? parsed.schedule : [];
    } catch {
      schedule = [];
    }

    if (!schedule.length) {
      schedule = buildSmartSchedule(effectiveWeakTopics, availableTime);
    }

    const scheduleDoc = await StudySchedule.findOneAndUpdate(
      { user: userId },
      { weakTopics: effectiveWeakTopics, availableTime, schedule },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      schedule,
      data: scheduleDoc,
      message: "Study schedule generated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate schedule",
    });
  }
};

const getSchedule = async (req, res) => {
  try {
    const userId = req.user._id;
    const schedule = await StudySchedule.findOne({ user: userId });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "No schedule found. Generate one first.",
      });
    }

    return res.status(200).json({ success: true, schedule: schedule.schedule || [], data: schedule });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch schedule",
    });
  }
};

export { generateSchedule, getSchedule };
