import { NextFunction, Request, Response } from 'express';
import multer, { Multer } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure multer to use memory storage so we can stream the file to Cloudinary
const storage = multer.memoryStorage();

// We will handle file filtering in our middleware, but basic config here is fine
const upload: Multer = multer({ storage: storage });

/**
 * Middleware to upload the file from memory to Cloudinary
 * This should be used AFTER multer has processed the request.
 */
const uploadToCloudinary = (req: Request, res: Response, next: NextFunction) => {
  // No file? Move on.
  if (!req.file) {
    return next();
  }

  // Define the upload stream from Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'afrikmarket',
      // Cloudinary will automatically detect the format
      // but we can add validation here if needed.
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return next(error); // Pass error to the Express error handler
      }
      
      // Attach Cloudinary result to the request for later use in controllers
      if (result) {
        // You may want to attach the entire result or just the URL
        // For example: req.body.imageUrl = result.secure_url;
        req.cloudinaryResult = result;
      }
      
      next();
    }
  );

  // Create a readable stream from the buffer in req.file and pipe it to Cloudinary
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

// We export both the multer instance and our custom middleware
export { upload, uploadToCloudinary };
