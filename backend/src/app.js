import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import branchRoutes from "./routes/branch.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import categoryKeywordRoutes from "./routes/category-keyword.routes.js";
import slaRoutes from "./routes/sla.routes.js";
import businessHoursRoutes from "./routes/business-hours.routes.js";
import reports from "./routes/reports.routes.js"

const app = express();
app.use(cookieParser());

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Parse JSON request bodies
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", categoryKeywordRoutes);
app.use("/api/sla", slaRoutes);
app.use("/api/business-hours", businessHoursRoutes);
app.use("/api/reports", reports);

// Health check
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Digaf Help Desk API is running.",
  });
});


export default app;
