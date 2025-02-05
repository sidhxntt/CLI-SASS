// Purpose: Main routes file to define all routes for the application. It imports all the sub-routes and initializes them.
// This file is then imported in the server file to initialize all the routes.

import users from "./users";
import Api_user from "./API_user";
import addresses from "./addresses";
import posts from "./posts";
import todos from "./todos";
import albums from "./albums";
import home from "./home";
import images from "./images";
import promClient from "prom-client";

// Prometheus metrics
promClient.collectDefaultMetrics();
const getMetrics = async () => promClient.register.metrics();

class MainRoutes {
  constructor(app) {
    this.app = app;
    this.path = "/api/v1";
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Home route
    this.app.use("/", home);

    // API routes
    this.app.use(`${this.path}`, Api_user);
    this.app.use(`${this.path}/users`, users);
    this.app.use(`${this.path}/posts`, posts);
    this.app.use(`${this.path}/todos`, todos);
    this.app.use(`${this.path}/albums`, albums);
    this.app.use(`${this.path}/addresses`, addresses);
    this.app.use(`${this.path}/images`, images);

    // Metrics route
    this.app.get("/metrics", async (_, res, next) => {
      try {
        const metrics = await getMetrics();
        res.set("Content-Type", promClient.register.contentType);
        res.send(metrics);
      } catch (error) {
        next(error);
      }
    });

    // Catch-all for undefined routes
    this.app.use("*", (_, res) => {
      res.status(404).json({ error: "Route not found" });
    });
  }
}

export default (app) => {
  new MainRoutes(app);
};
