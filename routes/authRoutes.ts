import express from 'express';
import { body } from 'express-validator';
// Importer tout le contrôleur sous un alias
import * as authController from '../controllers/authController';

const router = express.Router();

// --- Routes d'Inscription ---
// Utiliser l'alias pour accéder aux fonctions
router.get('/register', authController.getRegister);
router.post(
    '/register',
    [
        body('username', 'Le nom d\'utilisateur est requis').not().isEmpty(),
        body('email', 'Veuillez inclure un email valide').isEmail(),
        body('password', 'Veuillez entrer un mot de passe avec 6 caractères ou plus').isLength({ min: 6 })
    ],
    authController.postRegister
);

// --- Routes de Connexion ---
router.get('/login', authController.getLogin);
router.post(
    '/login',
    [
        body('email', 'Veuillez inclure un email valide').isEmail(),
        body('password', 'Le mot de passe est requis').exists()
    ],
    authController.postLogin
);

// --- Route de Déconnexion ---
router.post('/logout', authController.logout);

export default router;
