import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';
import { Request } from 'express';

// Define the storage engine for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req: Request, file: Express.Multer.File) => {
    return {
      folder: 'afrikmarket', // The name of the folder in Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed image formats
      transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional transformations
    };
  },
});

// Initialize multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

export default upload;