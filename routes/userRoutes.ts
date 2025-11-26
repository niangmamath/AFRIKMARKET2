import express, { Router } from 'express';
import { body } from 'express-validator';
import * as UserController from '../controllers/userController'; // Correctly import all controller functions
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { upload } from '../config/multer';

const router: Router = express.Router();

// Route pour mettre à jour le profil utilisateur, incluant l'upload de l'image de profil
router.put(
    '/profile',
    ensureAuthenticated,
    upload.single('profileImage'),
    [
        body('username', 'Le nom d\'utilisateur ne peut pas être vide.').not().isEmpty().trim(),
        body('email', 'Veuillez fournir un email valide.').isEmail().normalizeEmail()
    ],
    UserController.updateUserProfile
);

// Route pour récupérer les informations de l'utilisateur connecté
// Note: The route path for getUserProfile was changed from /me to /profile to match common practice
router.get(
    '/profile',
    ensureAuthenticated, 
    UserController.getUserProfile
);

export default router;
