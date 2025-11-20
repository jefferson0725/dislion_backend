import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  changePassword,
} from "../controllers/user.controller.js";
import { refreshToken, logout } from "../controllers/auth.controller.js";
import auth from "../middlewares/auth.js";

const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Protected
router.put("/change-password", auth(), changePassword);

// Admin (más adelante se protege con auth middleware)
router.get("/", getUsers);
router.get("/:id", getUserById);

export default router;
