
import express, { Router } from 'express';
import * as AdController from '../controllers/adController'; 
import { ensureAuthenticated } from '../middleware/authMiddleware';
// Importe le middleware de gestion de plusieurs images
import { handleMultiUpload } from '../config/multer'; 
import { adValidationRules } from '../validators/adValidator';

const router: Router = express.Router();

// Affiche le formulaire de création
router.get('/new', ensureAuthenticated, AdController.getNewAdForm);

// Crée une nouvelle annonce avec le middleware de téléversement multiple
router.post(
    '/',
    ensureAuthenticated,
    handleMultiUpload, // Utilise le middleware configuré pour plusieurs images
    adValidationRules,      
    AdController.createAd
);

// Affiche toutes les annonces
router.get('/', AdController.getAds);

// Affiche une annonce par son ID
router.get('/:id', AdController.getAd);

// Affiche le formulaire de modification
router.get('/:id/edit', ensureAuthenticated, AdController.getEditAdForm);

// Met à jour une annonce avec le middleware de téléversement multiple
router.put(
    '/:id',
    ensureAuthenticated,
    handleMultiUpload, // Utilise également ici pour la cohérence
    adValidationRules,      
    AdController.updateAd
);

// Supprime une annonce
router.delete('/:id', ensureAuthenticated, AdController.deleteAd);

export default router;
