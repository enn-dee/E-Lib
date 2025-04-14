import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

//  global error handler using ErrorRequestHandler
const errorHandler: ErrorRequestHandler = (
   err: HttpError,
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const statusCode = err.statusCode || err.status || 500;
   res.status(statusCode).json({
      message: err.message,
      errorStack: config.env === "development" ? err.stack : "",
   });
};

export default errorHandler;
