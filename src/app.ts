import express from "express";
import errorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";
import { config } from "./config/config";

const app = express();

app.use(express.json());
app.use(
   cors({
      origin: config.frontend_domain, //replace with proper cred
   })
);
app.use("/api/users", userRouter);

app.use("/api/books", bookRouter);

app.use(errorHandler);

export default app;
