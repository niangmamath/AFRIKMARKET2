import express, { Router } from 'express';
import { body } from 'express-validator';
import * as AdController from '../controllers/adController'; // Correctly import all controller functions
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { upload } from '../config/multer'; 

const router: Router = express.Router();

// Route pour créer une nouvelle annonce
router.post(
    '/',
    ensureAuthenticated,
    upload.single('image'), // Champ pour l'image de l'annonce
    [
        body('title', 'Le titre est requis').not().isEmpty(),
        body('price', 'Le prix doit être un nombre positif').isFloat({ gt: 0 }),
        body('description', 'La description est requise').not().isEmpty(),
    ],
    AdController.createAd
);

// Route pour récupérer toutes les annonces
router.get('/', AdController.getAds); // Corrected from getAllAds to getAds

// Route pour récupérer une annonce par son ID
router.get('/:id', AdController.getAd); // Corrected from getAdById to getAd

// Route pour mettre à jour une annonce
router.put(
    '/:id',
    ensureAuthenticated,
    upload.single('image'), // Permet de changer l'image lors de la mise à jour
    [
        body('title', 'Le titre est requis').not().isEmpty(),
        body('price', 'Le prix doit être un nombre positif').isFloat({ gt: 0 }),
        body('description', 'La description est requise').not().isEmpty(),
    ],
    AdController.updateAd
);

// Route pour supprimer une annonce
router.delete('/:id', ensureAuthenticated, AdController.deleteAd);

export default router;
