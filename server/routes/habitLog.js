import express from "express";
import { logHabit, getLogsByUser } from "../controllers/habitLog.js";

const habitLogRoutes = express.Router();

habitLogRoutes.get("/", getLogsByUser);
habitLogRoutes.post("/", logHabit);

export default habitLogRoutes;
