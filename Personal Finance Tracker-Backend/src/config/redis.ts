import { createClient } from "redis";

const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";

export const redisClient = createClient({
  // Hosted Redis provides a full URL (may include a password); fall back to host/port locally
  url: process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
};