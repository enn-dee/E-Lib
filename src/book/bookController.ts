import { NextFunction, Request, Response } from "express";
import path from "node:path";
import { cloudinary } from "../config/cloudinary";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1); //eg: application/pdf
      const fileName = files.coverImage[0].filename;
      const filePath = path.resolve(
         __dirname,
         "../../public/data/uploads",
         fileName
      );
      console.log("cloudinary.uploader exists:", !!cloudinary.uploader);

      const uploadResult = await cloudinary.uploader.upload(filePath, {
         filename_override: fileName,
         folder: "book-covers",
         format: coverImageMimeType,
      });
      console.log("upload result: ", uploadResult);
      res.json({ message: "book created" });
   } catch (err) {
      console.log("Error uploading file: ", err);
   }
};

export { createBook };
