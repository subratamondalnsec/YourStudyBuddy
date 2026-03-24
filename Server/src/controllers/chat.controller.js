import { ApiError } from "../utils/ApiError.js";
import { safeJsonParseFromGemini } from "../utils/functions.js";
import { callGeminiTextGenAPI } from "../utils/gemini.js";

const NON_STUDY_REPLY = "I only answer study-related questions. Please ask an academic question (programming, science, math, theory, exam prep, etc.).";

const fallbackStudyHeuristic = (text) => {
  const normalized = String(text || "").toLowerCase();
  const studyKeywords = [
    "study",
    "learn",
    "explain",
    "concept",
    "theory",
    "programming",
    "code",
    "math",
    "science",
    "history",
    "biology",
    "chemistry",
    "physics",
    "algorithm",
    "database",
    "exam",
    "revision",
    "question",
  ];

  return studyKeywords.some((keyword) => normalized.includes(keyword));
};

export const studyChat = async (req, res) => {
  try {
    const rawMessage = req.body?.message;
    const message = typeof rawMessage === "string" ? rawMessage.trim() : "";

    if (!message) {
      throw new ApiError(400, "message is required");
    }

    const prompt = `You are a strict study assistant.
Rules:
1) If the user question is study-related, answer clearly in short teaching style.
2) If not study-related, reply exactly with: ${NON_STUDY_REPLY}
3) Keep reply concise and helpful.

Return STRICT JSON only in this shape:
{"isStudyRelated":true,"reply":"..."}

User message: ${message}`;

    const raw = await callGeminiTextGenAPI(prompt);
    const parsed = safeJsonParseFromGemini(raw);

    if (parsed && typeof parsed === "object") {
      const isStudyRelated = Boolean(parsed.isStudyRelated);
      const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";

      return res.status(200).json({
        success: true,
        reply: isStudyRelated
          ? (reply || "Please share more details so I can explain better.")
          : NON_STUDY_REPLY,
      });
    }

    const fallbackIsStudy = fallbackStudyHeuristic(message);
    return res.status(200).json({
      success: true,
      reply: fallbackIsStudy
        ? "Please share your study question with a bit more detail, and I will help step by step."
        : NON_STUDY_REPLY,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to process chat request",
    });
  }
};
