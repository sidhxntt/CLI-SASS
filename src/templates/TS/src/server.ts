// Description: This file is the entry point of the application. It starts the server, connects to the database & redis, and initializes the routes.
// It also handles graceful shutdown of the server and database connections.
import express, { Application } from "express";
import AllRoutes from "./routes/Main_Routes";
import error_handling from "./controllers/error";
import cors from "cors";
import GracefulShutdown from "http-graceful-shutdown";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./utils/Prisma";
import { redis_connection, disconnectRedis } from "./utils/Redis";

dotenv.config();

export default class SERVER {
  private app: Application;
  private port: string | number;
  private httpServer: any; // Store the HTTP server instance
  private serverUrl: string;

  constructor() {
    this.app = express();
    this.port = process.env.MAIN_SERVER_PORT || 8000;
    this.serverUrl = process.env.MAIN_SERVER_URL || "http://localhost:8000";
    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    this.app.use(
      cors({
        origin: process.env.CLIENT,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    ), // Enable CORS

    this.app.use(express.json()); // Parse JSON bodies
    this.app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
    this.app.use(error_handling); //error handling middleware
    this.app.use(helmet()); //security middleware
  }

  private initializeRoutes(): void {
    AllRoutes(this.app);
  }

  public async start(): Promise<void> {
    try {
      await connectDB();
      redis_connection();

      this.httpServer = this.app.listen(this.port, () => {
        console.log(`Server is running at: ${this.serverUrl} 🏄`);
      });

      //graceful shutdown 
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
      if (error instanceof Error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
      }
      console.error("An unknown error occurred during server startup");
      process.exit(1);
    }
  }
}

const server = new SERVER();
server.start();
