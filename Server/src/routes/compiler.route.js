import { Router } from "express";
import {
  compileAndRun,
  getSubmissionStatus,
  getSupportedLanguages
} from "../controllers/compiler.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/execute", verifyToken, compileAndRun);
router.get("/status/:token", verifyToken, getSubmissionStatus);
router.get("/languages", verifyToken, getSupportedLanguages);

export default router;
