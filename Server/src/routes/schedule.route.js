import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { generateSchedule, getSchedule } from "../controllers/schedule.controller.js";

const router = Router();

router.post("/generate", verifyToken, generateSchedule);
router.get("/", verifyToken, getSchedule);

export default router;
