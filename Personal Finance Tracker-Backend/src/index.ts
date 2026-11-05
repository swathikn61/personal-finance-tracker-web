import express from "express";
import { AppDataSource } from "./utils/database";
import EntriesRoute from "./routes/EntriesRoute";
import SummariesRoute from "./routes/SummariesRoute";
import ExportRoute from "./routes/ExportRoute";
import { connectRedis } from "./config/redis";
import AuthRoute from "./routes/AuthRoute";
import { DailySummaryCron } from "./cron/DailySummaryCron";
import logger from "../src/utils/logger";
import dotenv from "dotenv";

dotenv.config();

const app = express();
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

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });

  } catch (error) {
    logger.error("Failed to start server", { error });
    console.error("Database connection failed", error);
  }
};

startServer();