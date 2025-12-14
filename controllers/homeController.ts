import { Request, Response } from 'express';
import Ad from '../models/Ad';
import Testimonial from '../models/Testimonial';

// @desc    Display home page with recent ads and testimonials
// @route   GET /
export const getHomePage = async (req: Request, res: Response) => {
    try {
        // Récupérer les 4 annonces les plus récentes et approuvées
        const recentAds = await Ad.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('author', 'username')
            .lean();

        // Récupérer les 3 derniers témoignages
        const testimonials = await Testimonial.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        res.render('index', {
            title: 'Accueil',
            recentAds: recentAds,
            testimonials: testimonials
        });

    } catch (err: any) {
        console.error("Error fetching home page data:", err);
        // CORRECTION : Utilisation de guillemets doubles pour éviter le conflit avec l'apostrophe.
        req.flash("error_msg", "Impossible de charger les données de la page d'accueil.");
        // Rendre la page même si une des requêtes échoue
        res.render('index', {
            title: 'Accueil', 
            recentAds: [],
            testimonials: []
        });
    }
};
