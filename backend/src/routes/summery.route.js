import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { getSummerySubjects ,  summerizeNote, getSummaries, deleteSummary, deleteSummerySubject, downloadSummaryFile} from "../controllers/summerise.controller.js";

const router = Router();

router.route("/get-summery-subjects").post(verifyToken, getSummerySubjects);
router.route("/summerize").post(verifyToken,summerizeNote);
router.route("/get-summeries").post(verifyToken,getSummaries);
router.route("/delete-summery").post(verifyToken,deleteSummary);
router.route("/delete-subject").post(verifyToken,deleteSummerySubject);
router.route("/download-summery-file").post(verifyToken, downloadSummaryFile);
export default router;