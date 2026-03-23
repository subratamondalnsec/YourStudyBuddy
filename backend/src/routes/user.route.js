import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAuthToken,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token", refreshAuthToken);


router.route("/get-user").post(verifyToken, getCurrentUser);


export default router;
