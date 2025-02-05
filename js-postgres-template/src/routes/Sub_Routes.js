import { Router } from "express";

export class SubRoutes {
  constructor() {
    this.router = Router();
  }

  endpoint(method, path, handler, middlewares = []) {
    this.router[method](path, ...middlewares, async (req, res, next) => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    });
  }

  getRouter() {
    return this.router;
  }
}
