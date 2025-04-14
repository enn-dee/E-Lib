import { NextFunction, Request, Response } from "express";
import path from "node:path";
import { cloudinary } from "../config/cloudinary";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
   const { title, genre } = req.body;
   if (!title || !genre) {
      next(createHttpError(400, "All fields are required"));
      return;
   }
   const files = req.files as { [fieldname: string]: Express.Multer.File[] };
   let uploadCoverResult, bookFileUploadRes;
   let filePath, bookFilePath;
   try {
      const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1); //eg: application/pdf

      const fileName = files.coverImage[0].filename;

      filePath = path.resolve(__dirname, "../../public/data/uploads", fileName);

      uploadCoverResult = await cloudinary.uploader.upload(filePath, {
         filename_override: fileName,
         folder: "book-covers",
         format: coverImageMimeType,
      });
      // console.log("upload cover image res: ", uploadCoverResult);
   } catch (err) {
      console.log("Error uploading Cover image: ", err);
   }
   try {
      const bookFileName = files.file[0].filename;

      bookFilePath = path.resolve(
         __dirname,
         "../../public/data/uploads",
         bookFileName
      );

      bookFileUploadRes = await cloudinary.uploader.upload(bookFilePath, {
         resource_type: "raw",
         filename_override: bookFileName,
         folder: "book-pdfs",
         format: "pdf",
      });
   } catch (err) {
      console.log("error uploading file: ", err);
      next(createHttpError(500, "Error uploading pdf file"));
   }
   try {
      const newBook = await bookModel.create({
         title,
         genre,
         author: "67fa729ae5c658ea8ea83011",
         coverImage: uploadCoverResult?.secure_url,
         file: bookFileUploadRes?.secure_url,
      });
      // console.log("file upload res: ", bookFileUploadRes);
      await fs.promises.unlink(filePath as string);
      await fs.promises.unlink(bookFilePath as string);
      res.status(201).json({ message: "Book created", id: newBook._id });
   } catch (err) {
      console.log("Error creating book", err);
      next(createHttpError(500, "Error creating book"));
   }
};

export { createBook };
