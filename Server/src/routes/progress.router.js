import express from 'express';
import {
  initializeProgress,
  getCourseProgress,
  completeLesson,
  updateCurrentLesson,
  getAllUserProgress,
  resetCourseProgress,
  getUserStats,
  canAccessLesson
} from '../controllers/progress.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Initialize or get progress for a course
router.post('/initialize/:courseId',verifyToken, initializeProgress);

// Get progress for a specific course
router.post('/:courseId',verifyToken, getCourseProgress);

// Mark a lesson as completed
router.post('/:courseId/lesson/:lessonId/complete',verifyToken, completeLesson);

// Update current lesson
router.post('/:courseId/lesson/:lessonId/current',verifyToken, updateCurrentLesson);

// Get all progress for the user
router.post('/',verifyToken, getAllUserProgress);

// Reset course progress
router.post('/:courseId/reset',verifyToken, resetCourseProgress);

// Get user statistics
router.post('/stats/user',verifyToken, getUserStats);

// Check if user can access a lesson
router.post('/:courseId/lesson/:lessonId/can-access',verifyToken, canAccessLesson);

export default router;
