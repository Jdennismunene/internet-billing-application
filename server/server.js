import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http from "http";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.routes.js";
import pingRoutes from "./routes/ping.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import resultsRoutes from "./routes/results.routes.js";
import setupPingSocket from "./ws/pingSocket.js";
dotenv.config();
await connectDB();

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
// app.use(cors());

app.use(cookieParser());
app.use(express.raw({ type: "application/octet-stream", limit: "100mb" }));

app.use("/api/upload", uploadRoutes);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ping", pingRoutes);
app.use("/api/download", downloadRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/results", resultsRoutes);

// WebSocket
setupPingSocket(server);
// app.get("/", (req, res) => {
//   res.send("Internet Billing System Backend Running...");
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
