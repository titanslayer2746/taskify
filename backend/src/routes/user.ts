import { Router } from "express";
import { register, login, logout, getProfile } from "../controllers/user";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// User authentication routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authenticateToken, getProfile);

export default router;
