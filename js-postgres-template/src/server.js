// Description: This file is the entry point of the application. It starts the server, connects to the database & redis, and initializes the routes.
// It also handles graceful shutdown of the server and database connections.\

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import GracefulShutdown from "http-graceful-shutdown";

import AllRoutes from "./routes/Main_Routes.js";
import error_handling from "./controllers/error.js";
import { redis_connection, disconnectRedis } from "./utils/client/Redis.js";
import { connectDB, disconnectDB } from "./utils/client/Prisma.js";

dotenv.config();

class SERVER {
  constructor() {
    this.app = express();
    this.port = process.env.MAIN_SERVER_PORT || 8000;
    this.serverUrl = process.env.MAIN_SERVER_URL || "http://localhost:8000";
    this.httpServer = null;

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  initializeMiddlewares() {
    this.app.use(
      cors({
        origin: process.env.CLIENT,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(error_handling);
    this.app.use(helmet());
  }

  initializeRoutes() {
    AllRoutes(this.app);
  }

  async start() {
    try {
      await connectDB();
      redis_connection();

      this.httpServer = this.app.listen(this.port, () => {
        console.log(`Server is running at: ${this.serverUrl} 🏄`);
      });

      // Graceful shutdown
      GracefulShutdown(this.httpServer, {
        signals: "SIGINT SIGTERM",
        timeout: 3000,
        development: false,
        forceExit: true,
        preShutdown: async () => {
          await disconnectRedis();
        },
        onShutdown: async () => {
          await disconnectDB();
        },
        finally: () => {
          console.info("Server gracefully shut down. 💅");
        },
      });
    } catch (error) {
      console.error("Server startup failed:", error.message || error);
      process.exit(1);
    }
  }
}

const server = new SERVER();
server.start();
