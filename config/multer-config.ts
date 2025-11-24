
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

// Define the type for the file to avoid 'any'
interface MulterFile extends Express.Multer.File {}

// Ensure the upload directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
        cb(null, uploadDir);
    },
    filename: (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
        // Create a unique filename to avoid overwrites and issues with special characters
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
    }
});

// File filter to allow only specific image types
const fileFilter = (req: Request, file: MulterFile, cb: FileFilterCallback) => {
    // Allowed extensions
    const allowedTypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        // When rejecting the file, pass an error that can be caught by middleware
        cb(new Error('Erreur : Seules les images (jpeg, jpg, png, gif) sont autorisées.'));
    }
};

// Initialize multer with the defined storage, file filter, and size limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB to prevent large uploads
    fileFilter: fileFilter
});

export default upload;
