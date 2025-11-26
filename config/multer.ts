import { Request } from 'express';
import multer, { Multer } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req: Request, file: Express.Multer.File) => {
    return {
      folder: 'afrikmarket',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

const upload: Multer = multer({ storage: storage });

// Use a named export instead of a default export
export { upload };
