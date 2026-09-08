import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { rateLimit } from "express-rate-limit";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://nova-frontend-yta0.onrender.com"],
    credentials: true,
  },
});

// Make io accessible in controllers via req.app.get('io')
app.set("io", io);

// Socket.io connection handling for real-time collaboration
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
  });

  socket.on("leave-project", (projectId) => {
    socket.leave(`project-${projectId}`);
  });

  socket.on("task-update", ({ projectId, task }) => {
    socket.to(`project-${projectId}`).emit("task-updated", task);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173", "https://nova-frontend-yta0.onrender.com"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate limiting on auth routes to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later",
});
app.use("/api/auth", authLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Nova API is running", timestamp: new Date() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Nova server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
