
import express, { Router } from 'express';
import * as UserController from '../controllers/userController';
import { ensureAuthenticated } from '../middleware/authMiddleware';
// Importe l'instance de base de multer pour une configuration flexible
import { multerUpload } from '../config/multer'; 
import { profileUpdateValidationRules } from '../validators/userValidator';

const router: Router = express.Router();

// Route pour obtenir le profil de l'utilisateur connecté
router.get(
    '/profile',
    ensureAuthenticated, 
    UserController.getUserProfile
);

// Route pour obtenir un profil utilisateur public
router.get(
    '/:id',
    UserController.getPublicUserProfile
);

// Route pour mettre à jour le profil utilisateur
router.put(
    '/profile',
    ensureAuthenticated,
    // Utilise l'instance de base et spécifie le nom du champ attendu
    multerUpload.single('profileImage'), 
    profileUpdateValidationRules,
    UserController.updateUserProfile
);

export default router;
