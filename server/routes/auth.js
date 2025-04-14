import express from "express";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../controllers/user.js"

const authRoutes = express.Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.get("/me", getCurrentUser);
authRoutes.get("/logout", logoutUser);

export default authRoutes;
