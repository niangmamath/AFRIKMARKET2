
import express from 'express';
import Ad, { IAd } from '../models/Ad'; // Assurez-vous que le chemin d'importation est correct

const router = express.Router();

// Route pour la page d'accueil
router.get('/', async (req, res) => {
    try {
        // Récupérer les 10 dernières annonces
        const latestAds: IAd[] = await Ad.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('author');

        res.render('index', { 
            recentAds: latestAds, // CORRECTION : Passer la variable sous le nom 'recentAds'
            title: 'Accueil'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur serveur');
    }
});

export default router;
