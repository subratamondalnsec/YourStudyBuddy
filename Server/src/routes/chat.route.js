import { Router } from "express";
import { studyChat } from "../controllers/chat.controller.js";

const router = Router();

router.post("/", studyChat);

export default router;
