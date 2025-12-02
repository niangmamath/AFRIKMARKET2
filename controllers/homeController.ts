import { Request, Response } from 'express';
import Ad from '../models/Ad';

// @desc    Display home page with recent ads
// @route   GET /
export const getHomePage = async (req: Request, res: Response) => {
    try {
        // CORRECTION : S'assure de ne récupérer QUE les annonces approuvées.
        const recentAds = await Ad.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('author', 'username')
            .lean();

        res.render('index', {
            title: 'Accueil',
            recentAds: recentAds
        });

    } catch (err: any) {
        console.error("Error fetching recent ads:", err);
        req.flash('error_msg', 'Impossible de charger les annonces récentes.');
        // Render the page gracefully even if ads can't be fetched
        res.render('index', {
            title: 'Accueil', 
            recentAds: []
        });
    }
};
