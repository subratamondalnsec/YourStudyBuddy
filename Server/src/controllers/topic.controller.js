import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { safeJsonParseFromGemini } from "../utils/functions.js";

const fallbackExplanation = (topic) => {
  return `${topic} is an important concept in software development. Focus on the core idea, when it is used, and common mistakes to avoid. Practicing small examples regularly will improve your understanding.`;
};

export const getTopicExplanation = async (req, res) => {
  try {
    const rawTopic = req.query.topic;
    const topic = typeof rawTopic === "string" ? rawTopic.trim() : "";

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "topic query parameter is required",
      });
    }

    const prompt = `Return strict JSON only with this shape: {"topic":"${topic}","explanation":"..."}. Explain ${topic} in 2-3 short sentences for a student. Keep it practical and beginner-friendly.`;

    let explanation = fallbackExplanation(topic);

    try {
      const response = await callGeminiTextGenAPI(prompt);
      const parsed = safeJsonParseFromGemini(response);
      const aiExplanation = parsed?.explanation;

      if (typeof aiExplanation === "string" && aiExplanation.trim()) {
        explanation = aiExplanation.trim();
      }
    } catch {
      explanation = fallbackExplanation(topic);
    }

    return res.status(200).json({
      success: true,
      topic,
      explanation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch topic explanation",
    });
  }
};
