
import express, { Router } from 'express';
import * as AdController from '../controllers/adController'; 
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { upload, uploadToCloudinary } from '../config/multer'; 
import { adValidationRules } from '../validators/adValidator'; // Import our new validation rules

const router: Router = express.Router();

// Route to display the form for creating a new ad
router.get('/new', ensureAuthenticated, AdController.getNewAdForm);

// Route to create a new ad, now using the validation rules
router.post(
    '/',
    ensureAuthenticated,
    upload.single('image'), 
    uploadToCloudinary,    
    adValidationRules,      // Apply the validation rules
    AdController.createAd
);

// Route to get all ads
router.get('/', AdController.getAds);

// Route to get a single ad by its ID
router.get('/:id', AdController.getAd);

// Route to display the form for editing an ad
router.get('/:id/edit', ensureAuthenticated, AdController.getEditAdForm);

// Route to update an ad, now using the validation rules
router.put(
    '/:id',
    ensureAuthenticated,
    upload.single('image'), 
    uploadToCloudinary,    
    adValidationRules,      // Apply the validation rules
    AdController.updateAd
);

// Route to delete an ad
router.delete('/:id', ensureAuthenticated, AdController.deleteAd);

export default router;
