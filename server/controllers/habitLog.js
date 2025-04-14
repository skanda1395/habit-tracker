import HabitLog from "../models/habitLog.js";

const logHabit = async (req, res) => {
  try {
    const { habitId, status } = req.body;

    const newLog = await HabitLog.create({
      user: req.userId,
      habit: habitId,
      status,
      date: new Date()
    });

    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: "Failed to log habit" });
  }
};

const getLogsByUser = async (req, res) => {
  try {
    const logs = await HabitLog.find({ user: req.userId }).populate("habit");
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get habit logs" });
  }
};

export { logHabit, getLogsByUser };
