import { Request, Response, NextFunction } from "express";
import logger from "../utils/Loki";

const error_handling = (err: Error, req: Request , res: Response, next: NextFunction) : void => {
  logger.error(err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message
    });
  };
  
export default error_handling;
  