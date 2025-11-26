import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import Ad from '../models/Ad';

// Extend the Express Request type to include our custom property
declare global {
  namespace Express {
    interface Request {
      cloudinaryResult?: UploadApiResponse;
    }
  }
}

const CATEGORIES = ['Immobilier', 'Véhicules', 'Maison & Jardin', 'Électronique', 'Loisirs', 'Mode', 'Autres'];

// @desc    Affiche toutes les annonces avec pagination et filtres
export const getAds = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 8;
        const category = req.query.category as string || '';
        const query: any = {};
        if (category) {
            query.category = category;
        }

        const result = await Ad.paginate(query, { page, limit, sort: { createdAt: -1 }, populate: 'author' });

        res.render('ads/index', {
            title: 'Toutes les annonces',
            ads: result.docs,
            current: result.page,
            totalPages: result.totalPages,
            category: category,
            categories: CATEGORIES
        });
    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur lors de la récupération des annonces.');
        res.redirect('/');
    }
};

// @desc    Affiche une seule annonce
export const getAd = async (req: Request, res: Response) => {
    try {
        const ad = await Ad.findById(req.params.id).populate('author');
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }

        const isAuthor = req.user && ad.author && (ad.author as any)._id.toString() === req.user._id.toString();
        const isAdmin = req.user && req.user.role === 'admin';

        res.render('ads/show', {
            title: ad.title,
            ad,
            isAuthor,
            isAdmin
        });
    } catch (err: any) {
        console.error(err.message);
        res.redirect('/ads');
    }
};

// @desc    Affiche le formulaire pour créer une nouvelle annonce
export const getNewAdForm = (req: Request, res: Response) => {
    res.render('ads/new', { title: 'Créer une annonce', categories: CATEGORIES, errors: [], oldInput: {} });
};

// @desc    Gère la création d'une nouvelle annonce
export const createAd = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('ads/new', {
            title: 'Créer une annonce', categories: CATEGORIES, errors: errors.array(), oldInput: req.body
        });
    }
    try {
        const { title, description, price, category } = req.body;
        const newAd = new Ad({
            title, description, price, category, author: req.user
        });

        // The uploadToCloudinary middleware has run, and the result is on req.cloudinaryResult
        if (req.cloudinaryResult) {
            newAd.imageUrl = req.cloudinaryResult.secure_url;
            newAd.imageFilename = req.cloudinaryResult.public_id; // public_id is the identifier for deletion
        }

        await newAd.save();
        req.flash('success_msg', 'Annonce créée avec succès !');
        res.redirect('/ads');
    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur lors de la création de l\'annonce.');
        res.redirect('/ads/new');
    }
};

// @desc    Affiche le formulaire pour éditer une annonce
export const getEditAdForm = async (req: Request, res: Response) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }
        res.render('ads/edit', { 
            title: 'Modifier l\'annonce', ad, categories: CATEGORIES, errors: [], oldInput: ad 
        });
    } catch (err: any) {
        console.error(err.message);
        res.redirect('/ads');
    }
};

// @desc    Gère la mise à jour d'une annonce
export const updateAd = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const adData = { ...req.body, _id: req.params.id };
        return res.status(400).render('ads/edit', {
            title: 'Modifier l\'annonce', ad: adData, categories: CATEGORIES, errors: errors.array(), oldInput: req.body
        });
    }
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée');
            return res.redirect('/ads');
        }

        // Update text fields
        ad.set(req.body);

        // Check if a new file was uploaded and processed by our middleware
        if (req.cloudinaryResult) {
            // Delete the old image from Cloudinary if it exists
            if (ad.imageFilename) {
                await cloudinary.uploader.destroy(ad.imageFilename);
            }
            // Save the new image details
            ad.imageUrl = req.cloudinaryResult.secure_url;
            ad.imageFilename = req.cloudinaryResult.public_id;
        }

        await ad.save(); // Save all changes (text and/or image)

        req.flash('success_msg', 'Annonce mise à jour avec succès !');
        res.redirect(`/ads/${ad._id}`);
    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur lors de la mise à jour.');
        res.redirect(`/ads/${req.params.id}/edit`);
    }
};

// @desc    Supprime une annonce
export const deleteAd = async (req: Request, res: Response) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }
        if (ad.imageFilename) {
            // This uses the public_id to delete the image from Cloudinary
            await cloudinary.uploader.destroy(ad.imageFilename);
        }
        await Ad.deleteOne({ _id: req.params.id });
        req.flash('success_msg', 'Annonce supprimée avec succès.');
        res.redirect('/ads');
    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur lors de la suppression.');
        res.redirect('/ads');
    }
};
