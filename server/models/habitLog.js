import mongoose from "mongoose";

const habitLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
  habit: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, },
  date: { type: Date, required: true, default: Date.now, },
  status: { type: String, enum: ["Completed", "Missed"], default: "Completed", }
});

const habitLog = mongoose.model("HabitLog", habitLogSchema);

export default habitLog;
