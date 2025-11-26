import multer from 'multer';
import CloudinaryStorage from 'multer-storage-cloudinary';
import cloudinary from './cloudinary';

// The library (v2) is a factory function, not a class. We call it directly.
const storage = CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'afrikmarket',
  allowedFormats: ['jpg', 'png', 'jpeg'], // Corrected property name for v2
  // The 'params' object and 'transformation' option are features of v4 and are removed.
});

// Initialize multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

export default upload;
