import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary, deleteFromCloudinary , extractPublicId ,downloadFromCloudinary,extractFilenameFromUrl} from "../utils/cloudinary.js";
import { countwords, extractTextFromFile, safeJsonParseFromGemini } from "../utils/functions.js";
import fs from "fs";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { fileURLToPath } from 'url';
import JSON5 from "json5";
import Course from "../models/course.models.js";
import Lesson from "../models/lesson.model.js";
import Module from "../models/modules.model.js";
import Quiz from "../models/quiz.model.js";
import { log } from "console";
import Progress from "../models/progress.model.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import QuizSession from "../models/quizSession.model.js";
import Activity from "../models/activity.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

// Create or get user progress for a course
export const initializeProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id; // Assuming user is authenticated

    // Check if progress already exists
    let progress = await Progress.findOne({ user: userId, course: courseId })
      .populate('completedLessons')
      .populate('currentLesson')
      .populate({
        path: 'course',
        populate: { path: 'lessons' }
      });

    if (!progress) {
      // Get course to set initial current lesson
      const course = await Course.findById(courseId).populate('lessons');
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Create new progress
      progress = new Progress({
        user: userId,
        course: courseId,
        currentLesson: course.lessons[0]._id, // Set first lesson as current
        completedLessons: [],
        xpEarned: 0,
        isCompleted: false
      });

      await progress.save();

      await Activity.create({
        user: userId,
        course: courseId,
        lesson: course.lessons[0]._id,
        courseName: course.title || "Course",
        activityType: "COURSE_STARTED",
        action: `Started course ${course.title || "Course"}`,
        timestamp: new Date(),
      });
      
      // Populate the created progress
      progress = await Progress.findById(progress._id)
        .populate('completedLessons')
        .populate('currentLesson')
        .populate({
          path: 'course',
          populate: { path: 'lessons' }
        });
    }

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error initializing progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize progress',
      error: error.message
    });
  }
};

// Get user progress for a specific course
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, course: courseId })
      .populate('completedLessons')
      .populate('currentLesson')
      .populate({
        path: 'course',
        populate: { path: 'lessons' }
      });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found for this course'
      });
    }

    // Calculate progress percentage
    const totalLessons = progress.course.lessons.length;
    const completedCount = progress.completedLessons.length;
    const progressPercentage = Math.round((completedCount / totalLessons) * 100);

    res.status(200).json({
      success: true,
      data: {
        ...progress.toObject(),
        progressPercentage,
        totalLessons,
        completedCount
      }
    });
  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course progress',
      error: error.message
    });
  }
};

// Mark a lesson as completed
export const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;
    const { xpGained = 10 } = req.body; // Default XP per lesson

    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found. Please initialize course progress first.'
      });
    }

    // Check if lesson is already completed
    if (progress.completedLessons.includes(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'Lesson already completed'
      });
    }

    // Get course to validate lesson and determine next lesson
    const course = await Course.findById(courseId).populate('lessons');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Validate if lesson belongs to this course
    const lessonExists = course.lessons.some(lesson => lesson._id.toString() === lessonId);
    if (!lessonExists) {
      return res.status(400).json({
        success: false,
        message: 'Lesson does not belong to this course'
      });
    }

    // Add lesson to completed lessons
    progress.completedLessons.push(lessonId);
    progress.xpEarned += xpGained;

    // Determine next lesson
    const currentLessonIndex = course.lessons.findIndex(
      lesson => lesson._id.toString() === lessonId
    );
    
    if (currentLessonIndex < course.lessons.length - 1) {
      // Set next lesson as current
      progress.currentLesson = course.lessons[currentLessonIndex + 1]._id;
    } else {
      // This was the last lesson, mark course as completed
      progress.isCompleted = true;
      progress.currentLesson = null;
    }

    await progress.save();

    await Activity.create({
      user: userId,
      course: courseId,
      lesson: lessonId,
      courseName: course.title || "Course",
      activityType: "LESSON_COMPLETED",
      action: `Completed lesson ${currentLessonIndex + 1}`,
      timestamp: new Date(),
    });

    // Update user's total XP if user model has totalXP field
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: { totalXP: xpGained }
      });
    } catch (userUpdateError) {
      console.log('User XP update failed (user model might not have totalXP field):', userUpdateError.message);
    }

    // Populate and return updated progress
    const updatedProgress = await Progress.findById(progress._id)
      .populate('completedLessons')
      .populate('currentLesson')
      .populate({
        path: 'course',
        populate: { path: 'lessons' }
      });

    const progressPercentage = Math.round((progress.completedLessons.length / course.lessons.length) * 100);

    res.status(200).json({
      success: true,
      message: progress.isCompleted ? 'Course completed!' : 'Lesson completed successfully',
      data: {
        ...updatedProgress.toObject(),
        progressPercentage,
        totalLessons: course.lessons.length,
        completedCount: progress.completedLessons.length
      }
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson',
      error: error.message
    });
  }
};

// Update current lesson (when user navigates)
export const updateCurrentLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    // Validate lesson belongs to course
    const course = await Course.findById(courseId).populate('lessons');
    const lessonExists = course.lessons.some(lesson => lesson._id.toString() === lessonId);
    
    if (!lessonExists) {
      return res.status(400).json({
        success: false,
        message: 'Lesson does not belong to this course'
      });
    }

    progress.currentLesson = lessonId;
    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Current lesson updated successfully',
      data: { currentLesson: lessonId }
    });
  } catch (error) {
    console.error('Error updating current lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update current lesson',
      error: error.message
    });
  }
};

// Get all user progress (all courses)
export const getAllUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const allProgress = await Progress.find({ user: userId })
      .populate('course', 'title description thumbnail duration')
      .populate('currentLesson', 'title')
      .sort({ updatedAt: -1 });

    // Calculate progress percentages
    const progressWithPercentages = await Promise.all(
      allProgress.map(async (progress) => {
        const course = await Course.findById(progress.course._id).populate('lessons');
        const totalLessons = course.lessons.length;
        const completedCount = progress.completedLessons.length;
        const progressPercentage = Math.round((completedCount / totalLessons) * 100);

        return {
          ...progress.toObject(),
          progressPercentage,
          totalLessons,
          completedCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: progressWithPercentages
    });
  } catch (error) {
    console.error('Error getting all user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: error.message
    });
  }
};

// Reset course progress
export const resetCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    // Get first lesson of the course
    const course = await Course.findById(courseId).populate('lessons');
    if (!course || course.lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course has no lessons'
      });
    }

    // Reset progress
    progress.completedLessons = [];
    progress.currentLesson = course.lessons[0]._id;
    progress.xpEarned = 0;
    progress.isCompleted = false;

    await progress.save();

    res.status(200).json({
      success: true,
      message: 'Course progress reset successfully',
      data: progress
    });
  } catch (error) {
    console.error('Error resetting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset course progress',
      error: error.message
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Progress.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          completedCourses: {
            $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
          },
          totalXP: { $sum: '$xpEarned' },
          totalCompletedLessons: { $sum: { $size: '$completedLessons' } }
        }
      }
    ]);

    const userStats = stats[0] || {
      totalCourses: 0,
      completedCourses: 0,
      totalXP: 0,
      totalCompletedLessons: 0
    };

    res.status(200).json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
};

// Check if user can access a lesson (prerequisite check)
export const canAccessLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ user: userId, course: courseId });
    const course = await Course.findById(courseId).populate('lessons');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const lessonIndex = course.lessons.findIndex(
      lesson => lesson._id.toString() === lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found in this course'
      });
    }

    let canAccess = false;
    let reason = '';

    if (lessonIndex === 0) {
      // First lesson is always accessible
      canAccess = true;
    } else if (!progress) {
      canAccess = false;
      reason = 'Course progress not initialized';
    } else {
      // Check if previous lesson is completed
      const previousLessonId = course.lessons[lessonIndex - 1]._id.toString();
      canAccess = progress.completedLessons.some(
        completedId => completedId.toString() === previousLessonId
      );
      reason = canAccess ? '' : 'Previous lesson not completed';
    }

    res.status(200).json({
      success: true,
      data: {
        canAccess,
        reason,
        lessonIndex: lessonIndex + 1,
        totalLessons: course.lessons.length
      }
    });
  } catch (error) {
    console.error('Error checking lesson access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check lesson access',
      error: error.message
    });
  }
};

export const getOverallProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const progressList = await Progress.find({ user: userId }).populate("course", "title topic lessons");
    const quizSessions = await QuizSession.find({ user: userId, status: "completed" });

    const totalCourses = progressList.length;
    const completedCourses = progressList.filter((item) => item.isCompleted).length;
    const completedLessons = progressList.reduce((sum, item) => sum + (item.completedLessons?.length || 0), 0);

    const totalLessons = progressList.reduce((sum, item) => {
      const lessonCount = item.course?.lessons?.length || 0;
      return sum + lessonCount;
    }, 0);

    const avgAccuracy = quizSessions.length
      ? Math.round(
          quizSessions.reduce((sum, session) => {
            if (!session.totalQuestions) return sum;
            return sum + (session.score / session.totalQuestions) * 100;
          }, 0) / quizSessions.length
        )
      : 0;

    const weakTopicMap = {};
    for (const session of quizSessions) {
      for (const weakTopic of session.weakTopics || []) {
        weakTopicMap[weakTopic] = (weakTopicMap[weakTopic] || 0) + 1;
      }
    }

    const weakAreas = Object.entries(weakTopicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    return res.status(200).json({
      success: true,
      data: {
        accuracy: avgAccuracy,
        coursesEnrolled: totalCourses,
        completedCourses,
        completedLessons,
        totalLessons,
        weakAreas,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch overall progress",
    });
  }
};

export const getTopicWiseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progressList = await Progress.find({ user: userId }).populate("course", "title topic lessons");
    const quizSessions = await QuizSession.find({ user: userId, status: "completed" });

    const topicStats = {};

    for (const progress of progressList) {
      const topic = progress.course?.topic || "General";
      if (!topicStats[topic]) {
        topicStats[topic] = {
          topic,
          completedLessons: 0,
          totalLessons: 0,
          quizzesTaken: 0,
          accuracy: 0,
        };
      }

      topicStats[topic].completedLessons += progress.completedLessons?.length || 0;
      topicStats[topic].totalLessons += progress.course?.lessons?.length || 0;
    }

    for (const session of quizSessions) {
      const course = progressList.find((item) => item.course?._id?.toString() === session.course?.toString())?.course;
      const topic = course?.topic || "General";
      if (!topicStats[topic]) continue;
      topicStats[topic].quizzesTaken += 1;
      topicStats[topic].accuracy += session.totalQuestions ? (session.score / session.totalQuestions) * 100 : 0;
    }

    const result = Object.values(topicStats).map((topic) => ({
      ...topic,
      completion: topic.totalLessons ? Math.round((topic.completedLessons / topic.totalLessons) * 100) : 0,
      accuracy: topic.quizzesTaken ? Math.round(topic.accuracy / topic.quizzesTaken) : 0,
    }));

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch topic-wise progress",
    });
  }
};

export const getProgressHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await QuizSession.find({ user: userId, status: "completed" })
      .populate("lesson", "title")
      .populate("course", "title topic")
      .sort({ completedAt: -1 })
      .limit(30);

    const formatted = history.map((item) => ({
      id: item._id,
      lessonTitle: item.lesson?.title || "Lesson",
      courseTitle: item.course?.title || "Course",
      topic: item.course?.topic || "General",
      score: item.score,
      totalQuestions: item.totalQuestions,
      accuracy: item.totalQuestions ? Math.round((item.score / item.totalQuestions) * 100) : 0,
      weakTopics: item.weakTopics || [],
      completedAt: item.completedAt,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch progress history",
    });
  }
};

export const getAccuracy = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    const attempts = await QuizAttempt.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          correct: {
            $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] },
          },
        },
      },
    ]);

    const aggregate = attempts[0] || { totalAttempts: 0, correct: 0 };
    const wrong = Math.max(aggregate.totalAttempts - aggregate.correct, 0);
    const accuracy = aggregate.totalAttempts
      ? Math.round((aggregate.correct / aggregate.totalAttempts) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      accuracy,
      correct: aggregate.correct,
      wrong,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate accuracy",
    });
  }
};

export const getWeakAreas = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    const user = await User.findById(userId).select("weakTopics strongTopics");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const weakAreaDocs = await QuizAttempt.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
        },
      },
      { $sort: { timestamp: -1 } },
      { $limit: 200 },
      {
        $group: {
          _id: "$topic",
          wrongCount: {
            $sum: { $cond: [{ $eq: ["$isCorrect", false] }, 1, 0] },
          },
          correctCount: {
            $sum: { $cond: [{ $eq: ["$isCorrect", true] }, 1, 0] },
          },
        },
      },
      { $sort: { wrongCount: -1 } },
    ]);

    const statsByTopic = new Map();
    weakAreaDocs.forEach((item) => {
      const topic = item?._id;
      if (!topic) return;
      const wrongCount = Number(item?.wrongCount || 0);
      const correctCount = Number(item?.correctCount || 0);
      const total = wrongCount + correctCount;
      const accuracy = total ? (correctCount / total) * 100 : 0;

      statsByTopic.set(topic, {
        topic,
        wrongCount,
        correctCount,
        accuracy,
      });
    });

    const persistedWeakTopics = Array.isArray(user.weakTopics) ? user.weakTopics : [];

    const weakTopics = [];
    const seen = new Set();

    for (const topic of persistedWeakTopics) {
      if (!topic || seen.has(topic)) continue;
      const stat = statsByTopic.get(topic);
      weakTopics.push({
        topic,
        wrongCount: stat?.wrongCount ?? 1,
      });
      seen.add(topic);
    }

    for (const [topic, stat] of statsByTopic.entries()) {
      if (seen.has(topic)) continue;
      if (stat.wrongCount <= 0) continue;
      if (stat.accuracy >= 70) continue;

      weakTopics.push({
        topic,
        wrongCount: stat.wrongCount,
      });
      seen.add(topic);
    }

    weakTopics.sort((a, b) => b.wrongCount - a.wrongCount);

    const strongSet = new Set(Array.isArray(user.strongTopics) ? user.strongTopics : []);
    const nextWeakTopics = weakTopics.map((item) => item.topic);
    const filteredStrongTopics = Array.from(strongSet).filter((topic) => !nextWeakTopics.includes(topic));

    if (
      JSON.stringify(user.weakTopics || []) !== JSON.stringify(nextWeakTopics) ||
      JSON.stringify(user.strongTopics || []) !== JSON.stringify(filteredStrongTopics)
    ) {
      user.weakTopics = nextWeakTopics;
      user.strongTopics = filteredStrongTopics;
      await user.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      weakTopics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get weak areas",
    });
  }
};

const toRelativeTime = (dateValue) => {
  if (!dateValue) return "Recently";
  const date = new Date(dateValue).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(Math.floor((now - date) / (1000 * 60)), 0);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;

    const activityDocs = await Activity.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(20)
      .select("courseName action activityType timestamp");

    const response = activityDocs.map((item) => ({
      course: item.courseName || "Course",
      action: item.action || item.activityType,
      time: toRelativeTime(item.timestamp),
    }));

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get recent activity",
    });
  }
};