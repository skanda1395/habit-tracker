import express from "express";
import { newHabit, getAllHabits, editHabit, deleteHabit } from "../controllers/habitController.js";

const habitRoutes = express.Router();

habitRoutes.post("/", newHabit);
habitRoutes.get("/", getAllHabits);
habitRoutes.put("/:id", editHabit);
habitRoutes.delete("/:id", deleteHabit);

export default habitRoutes;
