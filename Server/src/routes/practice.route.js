import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { generatePracticeQuestions } from "../controllers/practice.controller.js";

const router = Router();

router.post("/generate", verifyToken, generatePracticeQuestions);

export default router;
