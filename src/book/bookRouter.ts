import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import path from "node:path";
const bookRouter = express.Router();
const upload = multer({
   dest: path.resolve(__dirname, "../../public/data/uploads"),
   limits: { fieldSize: 3e7 }, //30mb
});
bookRouter.post(
   "/",
   upload.fields([{ name: "coverImage", maxCount: 1 }]),
   createBook
);
export default bookRouter;
