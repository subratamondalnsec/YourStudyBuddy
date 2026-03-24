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