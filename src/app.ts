import express from "express";
import errorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
   console.log(req.headers["user-agent"]);
   res.json({ message: "Home route" });
});

app.use("/api/users", userRouter);
app.use(errorHandler);

export default app;
