import { PrismaClient } from "@prisma/client";
import logger from "./Loki";

export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info("Successfully connected to database 🎯");
  } catch (error: any) {
    logger.error("Error connecting to database:", error.message || error);
  }
};

export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    logger.info("Successfully disconnected from database 🎯");
  } catch (error: any) {
    logger.error("Failed to disconnect from database:", error.message || error);
  }
};
