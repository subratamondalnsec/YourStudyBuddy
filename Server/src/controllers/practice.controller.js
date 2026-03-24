import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { safeJsonParseFromGemini } from "../utils/functions.js";

const fallbackQuestions = (topics = [], difficulty) => {
  const safeTopics = Array.isArray(topics) && topics.length ? topics : ["General"];

  return {
    questions: safeTopics.flatMap((topic) => [
      {
        question: `Which statement best explains ${topic}?`,
        options: [
          `${topic} is unrelated to software learning`,
          `${topic} is a concept used in modern development`,
          `${topic} can only be learned offline`,
          `${topic} has no practical use`,
        ],
        answerIndex: 1,
        difficulty,
        topic,
      },
      {
        question: `What is a good first step to improve ${topic} skills?`,
        options: ["Avoid practice", "Read random unrelated topics", "Hands-on exercises", "Skip fundamentals"],
        answerIndex: 2,
        difficulty,
        topic,
      },
    ]),
  };
};

const generatePracticeQuestions = async (req, res) => {
  try {
    const { topics = [], topic, difficulty = "medium" } = req.body;
    const normalizedTopics = Array.isArray(topics) && topics.length
      ? topics
      : (topic ? [topic] : []);

    if (!Array.isArray(normalizedTopics) || normalizedTopics.length === 0) {
      return res.status(400).json({ success: false, message: "topic or topics[] is required" });
    }

    const prompt = `Generate 2 multiple-choice questions per topic for these topics: ${JSON.stringify(normalizedTopics)} with difficulty ${difficulty}. Return strict JSON only in this shape: {"questions":[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"difficulty":"${difficulty}","topic":"Node.js"}]}.`;

    const response = await callGeminiTextGenAPI(prompt);
    const parsed = safeJsonParseFromGemini(response);

    const questions = Array.isArray(parsed?.questions) && parsed.questions.length
      ? parsed.questions
      : fallbackQuestions(normalizedTopics, difficulty).questions;

    return res.status(200).json({
      success: true,
      questions,
      data: { topics: normalizedTopics, difficulty, questions },
    });
  } catch (error) {
    const topics = Array.isArray(req.body.topics) ? req.body.topics : [req.body.topic || "General"];
    const difficulty = req.body.difficulty || "medium";

    return res.status(200).json({
      success: true,
      questions: fallbackQuestions(topics, difficulty).questions,
      data: fallbackQuestions(topics, difficulty),
      message: "AI unavailable. Returned fallback practice questions.",
    });
  }
};

export { generatePracticeQuestions };
