import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getTopicExplanation } from "../controllers/topic.controller.js";

const router = Router();

router.get("/explanation", verifyToken, getTopicExplanation);

export default router;
