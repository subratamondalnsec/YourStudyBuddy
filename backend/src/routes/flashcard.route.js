import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { createFlashcard , getFlashcardGroups,getFlashcardbyGroupId, deleteGroupbyId , deleteFlashcard} from "../controllers/flashcard.controller.js";

const router = Router();


router.route("/create").post(verifyToken, upload.none(), createFlashcard);
router.route("/groups").post(verifyToken, getFlashcardGroups);
router.route("/get").post(verifyToken, getFlashcardbyGroupId);  
router.route("/delete-group").post(verifyToken,deleteGroupbyId);
router.route("/delete-card").post(verifyToken,deleteFlashcard);

export default router;