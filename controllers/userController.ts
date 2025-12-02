import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import User, { IUser } from '../models/User';
import Ad from '../models/Ad';

/**
 * @desc    Affiche la page de profil de l'utilisateur avec ses annonces triées par statut.
 * @route   GET /profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }

        // Récupérer toutes les annonces de l'utilisateur
        const userAds = await Ad.find({ author: req.session.userId }).sort({ createdAt: -1 }).lean();

        // Séparer les annonces par statut
        const approvedAds = userAds.filter(ad => ad.status === 'approved');
        const pendingAds = userAds.filter(ad => ad.status === 'pending');
        const rejectedAds = userAds.filter(ad => ad.status === 'rejected');

        res.render('user/profile', {
            title: 'Mon Profil',
            user: user,
            approvedAds, // Annonces approuvées
            pendingAds,  // Annonces en attente
            rejectedAds, // Annonces rejetées
            errors: []
        });
    } catch (err: any) {
        console.error(err);
        req.flash('error_msg', 'Erreur lors de la récupération du profil.');
        res.redirect('/');
    }
};

/**
 * @desc    Met à jour les informations du profil utilisateur.
 * @route   PUT /profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // En cas d'erreur de validation, recharger la page avec les données nécessaires
        const user = await User.findById(req.session.userId);
        const userAds = await Ad.find({ author: req.session.userId }).sort({ createdAt: -1 }).lean();

        const approvedAds = userAds.filter(ad => ad.status === 'approved');
        const pendingAds = userAds.filter(ad => ad.status === 'pending');
        const rejectedAds = userAds.filter(ad => ad.status === 'rejected');

        return res.status(400).render('user/profile', {
            title: 'Mon Profil',
            user: user,
            approvedAds,
            pendingAds,
            rejectedAds,
            errors: errors.array(),
        });
    }

    try {
        const { username, email } = req.body;
        const user = await User.findById(req.session.userId) as IUser;

        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }

        // Mettre à jour le nom d'utilisateur et l'e-mail
        user.username = username;
        user.email = email;

        // Gérer le téléchargement de l'image de profil
        if (req.file) {
            // S'il y a une ancienne image, la supprimer de Cloudinary
            if (user.profileImageFilename) {
                await cloudinary.uploader.destroy(user.profileImageFilename);
            }
            user.profileImageUrl = req.file.path;
            user.profileImageFilename = req.file.filename;
        }

        await user.save();

        req.flash('success_msg', 'Profil mis à jour avec succès !');
        res.redirect('/profile');

    } catch (err: any) {
        console.error(err);
        // Gérer les erreurs de champs uniques (ex: e-mail déjà existant)
        if (err.code === 11000) {
            req.flash('error_msg', 'Cet email ou nom d\'utilisateur est déjà pris.');
        } else {
            req.flash('error_msg', 'Erreur lors de la mise à jour du profil.');
        }
        res.redirect('/profile');
    }
};
