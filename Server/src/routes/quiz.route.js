import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { generateWeakAreaQuiz, getQuizQuestions, getQuizResult, retryQuiz, startQuiz, submitQuiz, submitWeakAreaQuiz } from "../controllers/quiz.controller.js";

const router = Router();

router.post("/start", verifyToken, startQuiz);
router.get("/questions", verifyToken, getQuizQuestions);
router.post("/submit", verifyToken, submitQuiz);
router.get("/result", verifyToken, getQuizResult);
router.post("/retry", verifyToken, retryQuiz);
router.post("/weak-area", verifyToken, generateWeakAreaQuiz);
router.post("/weak-area/submit", verifyToken, submitWeakAreaQuiz);

export default router;
