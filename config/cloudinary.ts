import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import './env'; // Load environment variables

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true // Use https
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // You can add folder and format logic here
        return {
            folder: 'leboncoin', // Folder name on Cloudinary
            allowed_formats: ['jpeg', 'png', 'jpg', 'gif']
        };
    }
});

// Create the multer upload instance
const upload = multer({ storage: storage });

export default upload;
