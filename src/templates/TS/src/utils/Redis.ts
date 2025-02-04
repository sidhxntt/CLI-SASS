import Redis from "ioredis";
import logger from "./Loki";
import dotenv from "dotenv";
dotenv.config();

export const redis_connection = (): Redis => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "13977"),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  });

  redis.on("connect", () => {
    console.log("Successfully connected to Redis!");
  });

  redis.on("error", (err) => {
    console.error("Redis connection error:", err);
  });

  return redis;
};

export const disconnectRedis = async () => {
  const redis = redis_connection();
  try {
    await redis.quit();
    logger.info("Successfully disconnected from Redis 🚪");
  } catch (error: any) {
    logger.error("Failed to disconnect from Redis:", error.message || error);
  }
};
