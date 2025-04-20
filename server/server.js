import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import habitRoutes from "./routes/habit.js";
import authRoutes from "./routes/auth.js";
import habitLogRoutes from "./routes/habitLog.js";
import authMiddleware from "./middlewares/authMiddleware.js";
import connectDB from "./utils/db.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use(authMiddleware);
app.use("/api/habits", habitRoutes);
app.use("/api/habit-logs", habitLogRoutes);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  connectDB(process.env.MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`✅ Connected to test database for tests. Runnin on port: ${PORT}`));
  });
}

export default app;