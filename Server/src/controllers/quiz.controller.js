import Quiz from "../models/quiz.model.js";
import Lesson from "../models/lesson.model.js";
import QuizSession from "../models/quizSession.model.js";
import { ApiError } from "../utils/ApiError.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import Activity from "../models/activity.model.js";
import Course from "../models/course.models.js";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { safeJsonParseFromGemini } from "../utils/functions.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const normalizeQuestion = (question = {}) => ({
  question: question.question,
  options: Array.isArray(question.options) ? question.options : [],
  correctAnswer: Number(question.correctAnswer),
});

const toWeakTopic = (questionText = "") => {
  if (!questionText) return "General";
  return questionText.split("?")[0].trim().slice(0, 80) || "General";
};

const normalizeWeakAreaQuestion = (question = {}, fallbackTopic = "General", index = 0) => ({
  questionId: question.questionId || `wa-${Date.now()}-${index}`,
  question: question.question || `Practice question on ${fallbackTopic}`,
  topic: question.topic || fallbackTopic,
  options: Array.isArray(question.options) && question.options.length ? question.options : ["A", "B", "C", "D"],
  answerIndex: Number.isInteger(question.answerIndex) ? question.answerIndex : 0,
});

const buildWeakAreaFallbackQuestions = (topics = []) => {
  const safeTopics = topics.length ? topics : ["General"];
  return safeTopics.flatMap((topic, idx) => [
    normalizeWeakAreaQuestion(
      {
        questionId: `wa-${topic}-${idx}-1`,
        question: `Which approach improves your understanding of ${topic}?`,
        topic,
        options: [
          "Skip fundamentals",
          "Practice targeted problems and review mistakes",
          "Memorize without solving",
          "Avoid revision",
        ],
        answerIndex: 1,
      },
      topic,
      idx * 2
    ),
    normalizeWeakAreaQuestion(
      {
        questionId: `wa-${topic}-${idx}-2`,
        question: `What is the most effective next step after a wrong answer in ${topic}?`,
        topic,
        options: [
          "Move on immediately",
          "Ignore explanation",
          "Analyze error and retry similar questions",
          "Change topic instantly",
        ],
        answerIndex: 2,
      },
      topic,
      idx * 2 + 1
    ),
  ]);
};

const getUserWeakTopics = async (userId) => {
  const user = await User.findById(userId).select("weakTopics strongTopics");
  if (!user) throw new ApiError(404, "User not found");

  let weakTopics = Array.isArray(user.weakTopics) ? user.weakTopics.filter(Boolean) : [];

  if (!weakTopics.length) {
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

    weakTopics = weakAreaDocs.map((item) => item._id).filter(Boolean);
  }

  return {
    user,
    weakTopics: weakTopics.length ? weakTopics : ["General"],
  };
};

const startQuiz = async (req, res) => {
  try {
    const { lessonId, courseId } = req.body;
    const userId = req.user._id;

    if (!lessonId || !courseId) {
      throw new ApiError(400, "lessonId and courseId are required");
    }

    const lesson = await Lesson.findById(lessonId).populate("quiz");
    if (!lesson || !lesson.quiz) {
      throw new ApiError(404, "Quiz not found for this lesson");
    }

    const course = await Course.findById(courseId).select("title");

    const existingSession = await QuizSession.findOne({
      user: userId,
      lesson: lessonId,
      status: "in_progress",
    });

    if (existingSession) {
      return res.status(200).json({
        success: true,
        data: {
          sessionId: existingSession._id,
          status: existingSession.status,
        },
      });
    }

    const questions = (lesson.quiz.questions || []).map(normalizeQuestion);

    const session = await QuizSession.create({
      user: userId,
      course: courseId,
      lesson: lessonId,
      quiz: lesson.quiz._id,
      questions,
      answers: [],
      totalQuestions: questions.length,
      score: 0,
      weakTopics: [],
      status: "in_progress",
    });

    await Activity.create({
      user: userId,
      course: courseId,
      lesson: lessonId,
      courseName: course?.title || "Course",
      activityType: "QUIZ_STARTED",
      action: `Started quiz for ${lesson.title || "lesson"}`,
      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        status: session.status,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to start quiz",
    });
  }
};

const getQuizQuestions = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user._id;

    if (!sessionId) {
      throw new ApiError(400, "sessionId is required");
    }

    const session = await QuizSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new ApiError(404, "Quiz session not found");
    }

    const questions = session.questions.map((item, index) => ({
      questionIndex: index,
      question: item.question,
      options: item.options,
    }));

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        questions,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch quiz questions",
    });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { sessionId, answers } = req.body;
    const userId = req.user._id;

    if (!sessionId || !Array.isArray(answers)) {
      throw new ApiError(400, "sessionId and answers are required");
    }

    const session = await QuizSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new ApiError(404, "Quiz session not found");
    }

    const evaluatedAnswers = session.questions.map((question, index) => {
      const submitted = answers.find((item) => Number(item.questionIndex) === index);
      const selectedIndex = submitted ? Number(submitted.selectedIndex) : -1;
      const isCorrect = selectedIndex === question.correctAnswer;
      return {
        questionIndex: index,
        selectedIndex,
        isCorrect,
      };
    });

    const score = evaluatedAnswers.filter((item) => item.isCorrect).length;
    const weakTopics = evaluatedAnswers
      .filter((item) => !item.isCorrect)
      .map((item) => toWeakTopic(session.questions[item.questionIndex]?.question));

    session.answers = evaluatedAnswers;
    session.score = score;
    session.totalQuestions = session.questions.length;
    session.weakTopics = [...new Set(weakTopics)];
    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    const lesson = await Lesson.findById(session.lesson).select("title");
    const course = await Course.findById(session.course).select("title");

    const attemptDocs = evaluatedAnswers.map((item) => ({
      user: userId,
      course: session.course,
      lesson: session.lesson,
      quizSession: session._id,
      questionId: session.questions[item.questionIndex]?._id?.toString() || `${session._id}-${item.questionIndex}`,
      topic: toWeakTopic(session.questions[item.questionIndex]?.question),
      isCorrect: item.isCorrect,
      timestamp: new Date(),
    }));

    if (attemptDocs.length) {
      await QuizAttempt.insertMany(attemptDocs);
    }

    await Activity.create({
      user: userId,
      course: session.course,
      lesson: session.lesson,
      courseName: course?.title || "Course",
      activityType: "QUIZ_ATTEMPTED",
      action: `Attempted quiz in ${lesson?.title || "lesson"} (${score}/${session.totalQuestions})`,
      timestamp: new Date(),
    });

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        score,
        totalQuestions: session.totalQuestions,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit quiz",
    });
  }
};

const getQuizResult = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user._id;

    if (!sessionId) {
      throw new ApiError(400, "sessionId is required");
    }

    const session = await QuizSession.findOne({ _id: sessionId, user: userId }).populate("lesson", "title");
    if (!session) {
      throw new ApiError(404, "Quiz session not found");
    }

    const accuracy = session.totalQuestions ? Math.round((session.score / session.totalQuestions) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        lesson: session.lesson,
        score: session.score,
        totalQuestions: session.totalQuestions,
        accuracy,
        weakTopics: session.weakTopics,
        canProceed: session.score === session.totalQuestions,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to get quiz result",
    });
  }
};

const retryQuiz = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      throw new ApiError(400, "sessionId is required");
    }

    const session = await QuizSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      throw new ApiError(404, "Quiz session not found");
    }

    session.answers = [];
    session.score = 0;
    session.weakTopics = [];
    session.status = "in_progress";
    session.completedAt = null;
    await session.save();

    return res.status(200).json({
      success: true,
      message: "Quiz reset successfully",
      data: { sessionId: session._id },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retry quiz",
    });
  }
};

const generateWeakAreaQuiz = async (req, res) => {
  try {
    const userId = req.body.userId || req.user._id;
    const { user, weakTopics } = await getUserWeakTopics(userId);

    const prompt = `Generate exactly 2 MCQ questions per topic for these weak topics: ${JSON.stringify(weakTopics)}. Return strict JSON with shape: {"questions":[{"questionId":"q1","question":"...","topic":"Recursion","options":["A","B","C","D"],"answerIndex":0}]}`;

    let questions = [];
    try {
      const response = await callGeminiTextGenAPI(prompt);
      const parsed = safeJsonParseFromGemini(response);
      questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    } catch {
      questions = [];
    }

    if (!questions.length) {
      questions = buildWeakAreaFallbackQuestions(weakTopics);
    }

    const normalizedQuestions = questions.map((q, index) =>
      normalizeWeakAreaQuestion(q, weakTopics[index % weakTopics.length], index)
    );

    return res.status(200).json({
      success: true,
      questions: normalizedQuestions,
      weakTopics,
      strongTopics: user.strongTopics || [],
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to generate weak-area quiz",
    });
  }
};

const submitWeakAreaQuiz = async (req, res) => {
  try {
    const userId = req.body.userId || req.user._id;
    const { answers = [] } = req.body;

    if (!Array.isArray(answers) || !answers.length) {
      throw new ApiError(400, "answers array is required");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const topicStats = {};
    const attemptDocs = [];

    answers.forEach((item, index) => {
      const topic = item.topic || "General";
      const isCorrect = Boolean(item.isCorrect);

      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0, wrong: 0 };
      }

      topicStats[topic].total += 1;
      if (isCorrect) topicStats[topic].correct += 1;
      else topicStats[topic].wrong += 1;

      attemptDocs.push({
        user: userId,
        questionId: item.questionId || `wa-submit-${Date.now()}-${index}`,
        topic,
        isCorrect,
        timestamp: new Date(),
      });
    });

    if (attemptDocs.length) {
      await QuizAttempt.insertMany(attemptDocs);
    }

    const weakSet = new Set(Array.isArray(user.weakTopics) ? user.weakTopics : []);
    const strongSet = new Set(Array.isArray(user.strongTopics) ? user.strongTopics : []);
    const topicReport = [];

    Object.entries(topicStats).forEach(([topic, stats]) => {
      const accuracy = stats.total ? stats.correct / stats.total : 0;
      const becameStrong = accuracy >= 0.7;

      if (becameStrong) {
        weakSet.delete(topic);
        strongSet.add(topic);
      } else {
        strongSet.delete(topic);
        weakSet.add(topic);
      }

      topicReport.push({
        topic,
        total: stats.total,
        correct: stats.correct,
        wrong: stats.wrong,
        accuracy: Math.round(accuracy * 100),
        status: becameStrong ? "strong" : "weak",
      });
    });

    user.weakTopics = Array.from(weakSet);
    user.strongTopics = Array.from(strongSet);
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Weak-area quiz evaluated successfully",
      weakTopics: user.weakTopics,
      strongTopics: user.strongTopics,
      topicReport,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to submit weak-area quiz",
    });
  }
};

export { startQuiz, getQuizQuestions, submitQuiz, getQuizResult, retryQuiz, generateWeakAreaQuiz, submitWeakAreaQuiz };
