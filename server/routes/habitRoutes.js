import express from "express";
import Habit from "../models/Habit.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    const newHabit = new Habit({ name, description, frequency });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ message: "Error creating habit", error });
  }
});

router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find();
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching habits", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: "Error updating habit", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting habit", error });
  }
});

export default router;
