import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Entries } from "../entity/Entries";
import { User } from "../entity/User";
import { DailySummary } from "../entity/DailySummary";
import { Receipt } from "../entity/Receipt";
import { DecimalAmountsAndUniqueDailySummary1793404800000 } from "../migrations/1793404800000-DecimalAmountsAndUniqueDailySummary";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  // Hosted databases hand out a single connection string; it takes precedence over the DB_* values
  url: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.
  env.DB_DATABASE,
  synchronize: true, 
  logging: false,
  entities: [Entries,User,DailySummary,Receipt],
  migrations: [DecimalAmountsAndUniqueDailySummary1793404800000],
  migrationsRun: true,
});
