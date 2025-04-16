import { NextFunction, Request, Response } from "express";
import path from "node:path";
import { cloudinary } from "../config/cloudinary";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

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
      const _req = req as AuthRequest;
      const newBook = await bookModel.create({
         title,
         genre,
         author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const { title, description, genre } = req.body;
      const bookId = req.params.bookId;

      const book = await bookModel.findOne({ _id: bookId });

      if (!book) {
         return next(createHttpError(404, "Book not found"));
      }
      const _req = req as AuthRequest;
      if (book.author.toString() !== _req.userId) {
         return next(createHttpError(403, "You can not update others book."));
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let completeCoverImage = "";
      if (files.coverImage) {
         const filename = files.coverImage[0].filename;
         const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
         // send files to cloudinary
         const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + filename
         );
         completeCoverImage = filename;
         const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: converMimeType,
         });

         completeCoverImage = uploadResult.secure_url;
         await fs.promises.unlink(filePath);
      }

      // check if file field is exists.
      let completeFileName = "";
      if (files.file) {
         const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + files.file[0].filename
         );

         const bookFileName = files.file[0].filename;
         completeFileName = bookFileName;

         const uploadResultPdf = await cloudinary.uploader.upload(
            bookFilePath,
            {
               resource_type: "raw",
               filename_override: completeFileName,
               folder: "book-pdfs",
               format: "pdf",
            }
         );

         completeFileName = uploadResultPdf.secure_url;
         await fs.promises.unlink(bookFilePath);
      }

      const updatedBook = await bookModel.findOneAndUpdate(
         {
            _id: bookId,
         },
         {
            title: title,
            description: description,
            genre: genre,
            coverImage: completeCoverImage
               ? completeCoverImage
               : book.coverImage,
            file: completeFileName ? completeFileName : book.file,
         },
         { new: true }
      );

      res.json(updatedBook);
   } catch (error) {
      console.log("error updating book: ", error);
   }
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
   // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

   try {
      //todo: add pagination
      const book = await bookModel.find().populate("author", "name");
      res.json(book);
   } catch (err) {
      return next(createHttpError(500, "Error while getting a book"));
   }
};

const getSingleBook = async (
   req: Request,
   res: Response,
   next: NextFunction
): Promise<void> => {
   const bookId = req.params.bookId;

   try {
      const book = await bookModel
         .findOne({ _id: bookId })
         .populate("author", "name");
      if (!book) {
         return next(createHttpError(404, "Book not found."));
      }

      res.json(book);
      return;
   } catch (err) {
      return next(createHttpError(500, "Error while getting a book"));
   }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
   const bookId = req.params.bookId;
   const book = await bookModel.findOne({ _id: bookId });
   if (!book) {
      return next(createHttpError(404, "Book not found"));
   }
   const _req = req as AuthRequest;

   if (_req.userId.toString() !== book.author._id) {
      return next(createHttpError(403, "Not authorized to delete this book"));
   }

   try {
      const coverFileSplits = book.coverImage.split("/");
      const coverImagePubicId =
         coverFileSplits.at(-2) +
         "/" +
         coverFileSplits.at(-1)?.split(".").at(-2);

      const bookFileSplits = book.file.split("/");
      const bookFilePublicId =
         bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

      await cloudinary.uploader.destroy(coverImagePubicId);
      await cloudinary.uploader.destroy(bookFilePublicId, {
         resource_type: "raw",
      });

      await bookModel.deleteOne({ _id: bookId });
      res.status(204).json({ id: bookId });
      return;
   } catch (err) {
      console.log("Error deleting book: ", err);
      return next(createHttpError(500, "Error deleting book"));
   }
};
export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
