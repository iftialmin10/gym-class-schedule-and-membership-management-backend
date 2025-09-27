import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import {
  validateUserRegistration,
  validateLogin,
} from "../middleware/validation";

const router = Router();

router.post("/register", validateUserRegistration, register);
router.post("/login", validateLogin, login);

router.get("/profile", authenticateToken, getProfile);

export default router;
