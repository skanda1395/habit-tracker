import express from "express";
import { newHabit, getAllHabits, editHabit, deleteHabit, getHabitLogSummary } from "../controllers/habit.js";

const habitRoutes = express.Router();

habitRoutes.post("/", newHabit);
habitRoutes.get("/", getAllHabits);
habitRoutes.put("/:id", editHabit);
habitRoutes.delete("/:id", deleteHabit);
habitRoutes.get("/summary", getHabitLogSummary);

export default habitRoutes;
