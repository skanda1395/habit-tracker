import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import habitRoutes from "./routes/habitRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/habits", habitRoutes);

// MongoDB Connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((error) => console.log(`❌ Error: ${error.message}`));