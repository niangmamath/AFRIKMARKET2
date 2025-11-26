import express from 'express';
import { body } from 'express-validator';
import * as adController from '../controllers/adController';
import upload from '../config/multer'; // Correctly import multer instance
import { ensureAuthenticated, checkAdOwnership } from '../middleware/authMiddleware';

const router = express.Router();

// --- Public routes for ads ---
router.get('/', adController.getAds);

// --- Private routes for authenticated users ---
// IMPORTANT: Route for 'new' must come BEFORE route for ':id'
router.get('/new', ensureAuthenticated, adController.getNewAdForm);

// --- Public route for a single ad ---
// This must be after '/new' to avoid treating 'new' as an ID
router.get('/:id', adController.getAd);

// --- Actions for authenticated users ---
router.post(
    '/',
    ensureAuthenticated,
    upload.single('image'),
    [
        body('title', 'Le titre est requis').not().isEmpty(),
        body('price', 'Le prix doit être un nombre positif').isFloat({ gt: 0 }),
        body('description', 'La description est requise').not().isEmpty(),
        body('category', 'La catégorie est requise').not().isEmpty()
    ],
    adController.createAd
);

// --- Actions for ad owner ---
router.get('/:id/edit', ensureAuthenticated, checkAdOwnership, adController.getEditAdForm);
router.put(
    '/:id', 
    ensureAuthenticated, 
    checkAdOwnership, 
    upload.single('image'), 
    [
        body('title', 'Le titre est requis').not().isEmpty(),
        body('price', 'Le prix doit être un nombre positif').isFloat({ gt: 0 }),
        body('description', 'La description est requise').not().isEmpty(),
        body('category', 'La catégorie est requise').not().isEmpty()
    ],
    adController.updateAd
);
router.delete('/:id', ensureAuthenticated, checkAdOwnership, adController.deleteAd);

export default router;
