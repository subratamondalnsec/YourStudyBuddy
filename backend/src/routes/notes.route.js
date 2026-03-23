import { uploadNotes } from "../controllers/notesUpload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {getNotes, getsubjects, deleteSubject, deleteNote} from "../controllers/notesUpload.controller.js";
import { Router } from "express";

const router = Router();


router.route("/upload-notes").post(verifyToken, upload.single("file"), uploadNotes);
router.route("/get-notes").post(verifyToken, getNotes);
router.route("/get-subjects").post(verifyToken, getsubjects);
router.route("/delete-subject").post(verifyToken, deleteSubject);
router.route("/delete-note").post(verifyToken,deleteNote);
export default router;