import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  frequency: { type: String, enum: ["Daily", "Weekly", "Monthly"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;