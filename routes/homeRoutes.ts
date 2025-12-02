
import express from 'express';
import Ad, { IAd } from '../models/Ad'; // Assurez-vous que le chemin d'importation est correct

const router = express.Router();

// Route pour la page d'accueil
router.get('/', async (req, res) => {
    try {
        // CORRECTION : Récupérer les 10 dernières annonces APPROUVÉES
        const latestAds: IAd[] = await Ad.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('author');

        res.render('index', { 
            recentAds: latestAds,
            title: 'Accueil'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

export default router;
