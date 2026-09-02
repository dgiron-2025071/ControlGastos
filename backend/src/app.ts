import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/routes/auth.routes";
import activosRoutes from "./modules/activos/routes/activos.routes";
import dashboardRoutes from "./modules/dashboard/routes/dashboard.routes";

dotenv.config();

const app: Application = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api/activos", activosRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
