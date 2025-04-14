import { NextFunction, Request, Response } from "express";
import path from "node:path";
import { cloudinary } from "../config/cloudinary";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
   const files = req.files as { [fieldname: string]: Express.Multer.File[] };

   try {
      const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1); //eg: application/pdf

      const fileName = files.coverImage[0].filename;

      const filePath = path.resolve(
         __dirname,
         "../../public/data/uploads",
         fileName
      );

      const uploadCoverResult = await cloudinary.uploader.upload(filePath, {
         filename_override: fileName,
         folder: "book-covers",
         format: coverImageMimeType,
      });
      // console.log("upload cover image res: ", uploadCoverResult);
   } catch (err) {
      console.log("Error uploading Cover image: ", err);
      // next(createHttpError(500, "Error uploading cover image"));
   }
   try {
      const bookFileName = files.file[0].filename;

      const bookFilePath = path.resolve(
         __dirname,
         "../../public/data/uploads",
         bookFileName
      );

      const bookFileUploadRes = await cloudinary.uploader.upload(bookFilePath, {
         resource_type: "raw",
         filename_override: bookFileName,
         folder: "book-pdfs",
         format: "pdf",
      });

      // console.log("file upload res: ", bookFileUploadRes);

      res.json({ message: "Book created" });
   } catch (err) {
      console.log("error uploading file: ", err);

      next(createHttpError(500, "Error uploading pdf file"));
   }
};

export { createBook };
