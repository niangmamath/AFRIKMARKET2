
import express from 'express';
import * as authController from '../controllers/authController';
import { registerValidationRules, loginValidationRules } from '../validators/authValidator';

const router = express.Router();

// --- Routes d'Inscription ---
router.get('/register', authController.getRegister);
router.post(
    '/register',
    registerValidationRules, // Use the new validation rules
    authController.postRegister
);

// --- Routes de Connexion ---
router.get('/login', authController.getLogin);
router.post(
    '/login',
    loginValidationRules, // Use the new validation rules
    authController.postLogin
);

// --- Route de Déconnexion ---
router.post('/logout', authController.logout);

export default router;
