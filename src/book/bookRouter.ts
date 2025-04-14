import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import path from "node:path";
import { authenticate } from "../middlewares/authenticate";
const bookRouter = express.Router();

const upload = multer({
   dest: path.resolve(__dirname, "../../public/data/uploads"),
   limits: { fieldSize: 10 * 1024 * 1024 }, //10MB
});

bookRouter.post(
   "/",
   authenticate,
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "file", maxCount: 1 },
   ]),
   createBook
);

export default bookRouter;
