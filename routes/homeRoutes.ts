import express from 'express';
import { getHomePage } from '../controllers/homeController';

const router = express.Router();

// @desc    Affiche la page d'accueil
// @route   GET /
// CORRECTION : Simplification pour utiliser directement le contrôleur importé,
// qui contient maintenant la logique pour récupérer les annonces et les témoignages.
router.get('/', getHomePage);

// @desc    Affiche la page de politique de confidentialité
// @route   GET /privacy
router.get('/privacy', (req, res) => {
    res.render('pages/privacy', { title: 'Politique de confidentialité' });
});

// @desc    Affiche la page des conditions d'utilisation
// @route   GET /terms
router.get('/terms', (req, res) => {
    res.render('pages/terms', { title: "Conditions d\'utilisation" });
});

export default router;
