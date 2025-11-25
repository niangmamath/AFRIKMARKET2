
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import './env'; // Load environment variables

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
    secure: true
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'leboncoin',
        // The type for allowedFormats is string[]
        allowedFormats: ['jpeg', 'png', 'jpg', 'gif'],
    } as { [key: string]: any }, // Type assertion to match expected params
});

// Create the multer upload instance
const upload = multer({ storage: storage });

export default upload;
