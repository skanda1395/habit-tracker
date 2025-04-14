import mongoose from "mongoose";
import Habit from "../models/Habit.js";

const newHabit = async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    const newHabit = new Habit({ name, description, frequency, user: req.userId });
    await newHabit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(500).json({ message: "Error creating habit", error });
  }
};

const getAllHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: "Error fetching habits", error });
  }
};

const editHabit = async (req, res) => {
  const { id } = req.params;
  const { name, description, frequency } = req.body;

  try {
    const habit = await Habit.findOne({ _id: id, user: req.userId });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    habit.name = name ?? habit.name;
    habit.description = description ?? habit.description;
    habit.frequency = frequency ?? habit.frequency;

    await habit.save();

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: "Error updating habit", error: error.message });
  }
};

const deleteHabit = async (req, res) => {
  const { id } = req.params;

  try {
    const habit = await Habit.findOneAndDelete({ _id: id, user: req.userId });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or not authorized' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting habit', error: error.message });
  }
};

const getHabitLogSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const summary = await Habit.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'habitlogs',
          localField: '_id',
          foreignField: 'habit',
          as: 'logs'
        }
      },
      { $unwind: { path: '$logs', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            habitId: '$_id',
            habitName: '$name',
            status: '$logs.status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.habitId',
          habitName: { $first: '$_id.habitName' },
          doneCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'Completed'] }, '$count', 0]
            }
          },
          missedCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.status', 'missed'] }, '$count', 0]
            }
          }
        }
      }
    ]);    

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving habit summary" });
  }
};

export { newHabit, getAllHabits, editHabit, deleteHabit, getHabitLogSummary };