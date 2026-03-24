import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createCourse, fetchallCourses, fetchCourseById , fetchCourseStructure, fetchCourseTopics} from "../controllers/courses.controller.js";

const router = Router();



router.route("/create").post(verifyToken,createCourse);
router.route("/fetchAll").get(fetchallCourses);
router.route("/topics").get(fetchCourseTopics);
router.route("/course/:courseId").get(fetchCourseById);
router.route("/structure").post(verifyToken,fetchCourseStructure);




export default router;
