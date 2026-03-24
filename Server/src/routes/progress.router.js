import express from 'express';
import {
  initializeProgress,
  getCourseProgress,
  completeLesson,
  updateCurrentLesson,
  getAllUserProgress,
  resetCourseProgress,
  getUserStats,
  canAccessLesson,
  getOverallProgress,
  getTopicWiseProgress,
  getProgressHistory,
  getAccuracy,
  getWeakAreas,
  getRecentActivity,
  getPersonalizedRecommendations,
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

// Overall performance
router.get('/', verifyToken, getOverallProgress);

// Accuracy stats
router.get('/accuracy', verifyToken, getAccuracy);

// Weak areas list
router.get('/weak-areas', verifyToken, getWeakAreas);

// Recent activity timeline
router.get('/recent-activity', verifyToken, getRecentActivity);

// Personalized recommendation patterns
router.get('/recommendations', verifyToken, getPersonalizedRecommendations);

// Topic-wise performance
router.get('/topic', verifyToken, getTopicWiseProgress);

// Quiz/progress history
router.get('/history', verifyToken, getProgressHistory);

// Reset course progress
router.post('/:courseId/reset',verifyToken, resetCourseProgress);

// Get user statistics
router.post('/stats/user',verifyToken, getUserStats);

// Check if user can access a lesson
router.post('/:courseId/lesson/:lessonId/can-access',verifyToken, canAccessLesson);

export default router;
