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

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://nova-frontend-yta0.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin
    // (Postman, server-to-server requests, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(httpServer, {
  cors: corsOptions,
});

// Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// =====================================================
// SOCKET.IO CONNECTION HANDLING
// =====================================================

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

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Morgan only during development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// =====================================================
// RATE LIMITING
// =====================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later",
});

app.use("/api/auth", authLimiter);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nova API is running",
    timestamp: new Date(),
  });
});

// =====================================================
// ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/notifications", notificationRoutes);

// =====================================================
// ERROR HANDLING
// =====================================================

app.use(notFound);

app.use(errorHandler);

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(
    `Nova server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// =====================================================
// UNHANDLED REJECTION
// =====================================================

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});