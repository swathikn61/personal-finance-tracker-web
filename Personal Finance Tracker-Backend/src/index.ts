import express from "express";
import { AppDataSource } from "./utils/database";
import EntriesRoute from "./routes/EntriesRoute";
import SummariesRoute from "./routes/SummariesRoute";
import ExportRoute from "./routes/ExportRoute";
import { connectRedis } from "./config/redis";
import AuthRoute from "./routes/AuthRoute";
import { DailySummaryCron } from "./cron/DailySummaryCron";
import logger from "./utils/logger";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const app = express();
// Behind a hosting proxy (Render, etc.) so rate limiting sees the real client IP
app.set("trust proxy", 1);
app.use(express.json());

const startServer = async () => {
  try {
    await connectRedis();
    await AppDataSource.initialize();
    await DailySummaryCron();
    console.log("Database connected");

    app.use('/api/v1/entries', EntriesRoute);
    app.use('/api/v1/summary', SummariesRoute);
    app.use('/api/v1/export', ExportRoute);
    app.use('/api/v1/auth', AuthRoute);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    logger.error("Failed to start server", { error });
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

startServer();