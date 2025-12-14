
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import Ad from '../models/Ad';

const CATEGORIES = ['Immobilier', 'Véhicules', 'Maison & Jardin', 'Électronique', 'Loisirs', 'Mode', 'Autres'];

// Fonction helper pour l'upload vers Cloudinary
const uploadToCloudinary = (file: Express.Multer.File): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'afrikmarket', transformation: [{ width: 800, height: 800, crop: 'limit' }] },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Cloudinary upload failed.'));
                resolve(result);
            }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
};

// Affiche toutes les annonces
export const getAds = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 8;
        const result = await Ad.paginate({ status: 'approved' }, {
            page, limit, sort: { createdAt: -1 }, populate: 'author'
        });
        res.render('ads/index', {
            title: 'Toutes les annonces', ads: result.docs, current: result.page, totalPages: result.totalPages
        });
    } catch (err: any) {
        console.error(err);
        res.redirect('/');
    }
};

// Affiche une seule annonce
export const getAd = async (req: Request, res: Response) => {
    try {
        const ad = await Ad.findById(req.params.id).populate('author');
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }
        const isAuthor = req.user && ad.author && (ad.author as any)._id.toString() === req.user._id.toString();
        res.render('ads/show', { title: ad.title, ad, isAuthor, originalUrl: req.originalUrl });
    } catch (err: any) {
        console.error(err);
        res.redirect('/ads');
    }
};

// Affiche le formulaire de création
export const getNewAdForm = (req: Request, res: Response) => {
    res.render('ads/new', { title: 'Créer une annonce', categories: CATEGORIES, errors: [], oldInput: {} });
};

// Crée une annonce (Sécurisé avec images multiples)
export const createAd = async (req: Request, res: Response) => {
    if (!req.user) {
        req.flash('error_msg', 'Vous devez être connecté pour créer une annonce.');
        return res.redirect('/auth/login');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('ads/new', { title: 'Créer une annonce', categories: CATEGORIES, errors: errors.array(), oldInput: req.body });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        req.flash('error_msg', 'Vous devez télécharger au moins une image.');
        return res.status(400).render('ads/new', { title: 'Créer une annonce', categories: CATEGORIES, errors: [{ msg: 'Vous devez télécharger au moins une image.' }], oldInput: req.body });
    }

    try {
        const { title, description, price, category, location, phoneNumber, affiliateLink } = req.body;

        const newAdData: any = {
            title,
            description,
            price,
            category,
            location,
            phoneNumber,
            author: req.user,
            imageUrls: [] // Initialiser le tableau d'URLs
        };

        // Seul un admin peut ajouter un lien d'affiliation
        if (req.user.role === 'admin' && affiliateLink) {
            newAdData.affiliateLink = affiliateLink;
        }
        
        // Téléverser les images en parallèle
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        const uploadResults = await Promise.all(uploadPromises);
        newAdData.imageUrls = uploadResults.map(result => result.secure_url);

        const newAd = new Ad(newAdData);
        await newAd.save();
        
        req.flash('success_msg', 'Annonce créée avec succès ! Elle est en attente d\'approbation.');
        res.redirect('/ads');
    } catch (err: any) {
        console.error(err);
        req.flash('error_msg', 'Erreur lors de la création de l\'annonce.');
        res.redirect('back');
    }
};

// Affiche le formulaire d'édition
export const getEditAdForm = async (req: Request, res: Response) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }
        res.render('ads/edit', { title: 'Modifier l\'annonce', ad, categories: CATEGORIES, errors: [] });
    } catch (err: any) {
        console.error(err);
        res.redirect('/ads');
    }
};

// Met à jour une annonce (Sécurisé avec images multiples)
export const updateAd = async (req: Request, res: Response) => {
    if (!req.user) {
        req.flash('error_msg', 'Action non autorisée.');
        return res.redirect('/');
    }
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }

        const { title, description, price, category, location, phoneNumber, affiliateLink } = req.body;
        ad.title = title;
        ad.description = description;
        ad.price = price;
        ad.category = category;
        ad.location = location;
        ad.phoneNumber = phoneNumber;

        if (req.user.role === 'admin') {
            ad.affiliateLink = affiliateLink || undefined;
        } else if (ad.affiliateLink) {
           // Empêche un non-admin de modifier/supprimer un lien existant
        }

        ad.status = 'pending';

        const files = req.files as Express.Multer.File[];
        // Si de nouvelles images sont téléchargées, les traiter
        if (files && files.length > 0) {
            const uploadPromises = files.map(file => uploadToCloudinary(file));
            const uploadResults = await Promise.all(uploadPromises);
            // Remplacer les anciennes images par les nouvelles
            ad.imageUrls = uploadResults.map(result => result.secure_url);
        }

        await ad.save();
        req.flash('success_msg', 'Annonce mise à jour et en attente d\'approbation.');
        res.redirect(`/ads/${ad._id}`);
    } catch (err: any) {
        console.error(err);
        req.flash('error_msg', 'Erreur lors de la mise à jour.');
        res.redirect(`/ads/${req.params.id}/edit`);
    }
};

// Supprime une annonce
export const deleteAd = async (req: Request, res: Response) => {
    try {
        await Ad.deleteOne({ _id: req.params.id });
        req.flash('success_msg', 'Annonce supprimée avec succès.');
        res.redirect('/ads');
    } catch (err: any) {
        console.error(err);
        res.redirect('/ads');
    }
};
