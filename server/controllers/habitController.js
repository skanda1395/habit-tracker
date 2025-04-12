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
  } catch (err) {
    res.status(500).json({ message: 'Error updating habit', error: err.message });
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
  } catch (err) {
    res.status(500).json({ message: 'Error deleting habit', error: err.message });
  }
};

export { newHabit, getAllHabits, editHabit, deleteHabit };