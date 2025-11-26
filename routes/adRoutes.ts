import express, { Router } from 'express';
import { body } from 'express-validator';
import * as AdController from '../controllers/adController'; // Correctly import all controller functions
import { ensureAuthenticated } from '../middleware/authMiddleware';
// Import both upload and our new middleware
import { upload, uploadToCloudinary } from '../config/multer'; 

const router: Router = express.Router();

// Route to create a new ad
router.post(
    '/',
    ensureAuthenticated,
    upload.single('image'), // 1. Multer handles the file and stores it in memory
    uploadToCloudinary,     // 2. Our middleware uploads it to Cloudinary
    [
        body('title', 'Le titre est requis').not().isEmpty(),
        body('price', 'Le prix doit être un nombre positif').isFloat({ gt: 0 }),
        body('description', 'La description est requise').not().isEmpty(),
    ],
    AdController.createAd
);

// Route to get all ads
router.get('/', AdController.getAds);

// Route to get a single ad by its ID
router.get('/:id', AdController.getAd);

// Route to update an ad
router.put(
    '/:id',
    ensureAuthenticated,
    upload.single('image'), // 1. Multer handles the file
    uploadToCloudinary,     // 2. Our middleware uploads it
    [
        body('title', 'Le titre est requis').not().isEmpty(),
        body('price', 'Le prix doit être un nombre positif').isFloat({ gt: 0 }),
        body('description', 'La description est requise').not().isEmpty(),
    ],
    AdController.updateAd
);

// Route to delete an ad
router.delete('/:id', ensureAuthenticated, AdController.deleteAd);

export default router;