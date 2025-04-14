import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request {
   userId: string;
}
const authenticate = (req: Request, res: Response, next: NextFunction) => {
   const token = req.header("Authorization");
   if (!token) {
      return next(createHttpError(401, "Authentication token required"));
   }
   const parsedToken = token.split(" ")[1];
   if (!parsedToken) {
      return next(createHttpError(401, "Invalid token format"));
   }
   try {
      //   const decoded = jwt.decode(parsedToken as string, config.jwtSecret);
      const decoded = jwt.verify(parsedToken, config.jwtSecret as string);

      const _req = req as AuthRequest;
      _req.userId = decoded?.sub as string;

      next();
   } catch (err) {
      //   console.log("error in auth mw: ", err);
      return next(createHttpError(401, "Invalid or expired token"));
   }
};

export { authenticate };
