import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);


// Health check
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Digaf Help Desk API is running.",
  });
});


export default app;
