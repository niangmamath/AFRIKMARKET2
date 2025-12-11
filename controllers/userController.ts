import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import User, { IUser } from '../models/User';
import Ad from '../models/Ad';

/**
 * @desc    Affiche la page de profil de l'utilisateur connecté avec ses annonces triées par statut.
 * @route   GET /user/profile
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }

        const userAds = await Ad.find({ author: req.session.userId }).sort({ createdAt: -1 }).lean();

        const approvedAds = userAds.filter(ad => ad.status === 'approved');
        const pendingAds = userAds.filter(ad => ad.status === 'pending');
        const rejectedAds = userAds.filter(ad => ad.status === 'rejected');

        res.render('user/profile', {
            title: 'Mon Profil',
            profileUser: user, // L'utilisateur consulté est l'utilisateur connecté
            isPublicProfile: false, // Ce n'est pas une vue publique
            approvedAds,
            pendingAds,
            rejectedAds,
            errors: []
        });
    } catch (err: any) {
        console.error(err);
        req.flash('error_msg', 'Erreur lors de la récupération du profil.');
        res.redirect('/');
    }
};

/**
 * @desc    Affiche une page de profil utilisateur publique avec ses annonces approuvées.
 * @route   GET /user/:id
 */
export const getPublicUserProfile = async (req: Request, res: Response) => {
    try {
        // Rediriger vers le profil personnel si l'ID correspond à celui de l'utilisateur connecté
        if (req.session.userId && req.params.id === req.session.userId.toString()) {
            return res.redirect('/user/profile');
        }

        const profileUser = await User.findById(req.params.id).lean();

        if (!profileUser) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }

        // Ne récupérer que les annonces approuvées pour un profil public
        const userAds = await Ad.find({ author: profileUser._id, status: 'approved' })
            .sort({ createdAt: -1 })
            .lean();

        res.render('user/profile', {
            title: `Profil de ${profileUser.username}`,
            profileUser: profileUser, // L'utilisateur consulté
            isPublicProfile: true,    // C'est une vue publique
            approvedAds: userAds,
            pendingAds: [],  // Non affiché sur les profils publics
            rejectedAds: [], // Non affiché sur les profils publics
            errors: []
        });

    } catch (err: any) {
        console.error(err);
        req.flash('error_msg', 'Erreur lors de la récupération du profil public.');
        res.redirect('/');
    }
};


/**
 * @desc    Met à jour les informations du profil utilisateur.
 * @route   PUT /user/profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
    // Cette fonction ne fonctionne que pour l'utilisateur connecté
    const errors = validationResult(req);
    const user = await User.findById(req.session.userId);

    if (!user) {
        req.flash('error_msg', 'Utilisateur non trouvé.');
        return res.redirect('/');
    }

    if (!errors.isEmpty()) {
        const userAds = await Ad.find({ author: req.session.userId }).sort({ createdAt: -1 }).lean();
        const approvedAds = userAds.filter(ad => ad.status === 'approved');
        const pendingAds = userAds.filter(ad => ad.status === 'pending');
        const rejectedAds = userAds.filter(ad => ad.status === 'rejected');

        return res.status(400).render('user/profile', {
            title: 'Mon Profil',
            profileUser: user,
            isPublicProfile: false,
            approvedAds,
            pendingAds,
            rejectedAds,
            errors: errors.array(),
        });
    }

    try {
        const { username, email } = req.body;
        
        user.username = username;
        user.email = email;

        if (req.file) {
            if (user.profileImageFilename) {
                await cloudinary.uploader.destroy(user.profileImageFilename);
            }
            user.profileImageUrl = req.file.path;
            user.profileImageFilename = req.file.filename;
        }

        await user.save();

        req.flash('success_msg', 'Profil mis à jour avec succès !');
        res.redirect('/user/profile');

    } catch (err: any) {
        console.error(err);
        if (err.code === 11000) {
            req.flash('error_msg', 'Cet email ou nom d\'utilisateur est déjà pris.');
        } else {
            req.flash('error_msg', 'Erreur lors de la mise à jour du profil.');
        }
        res.redirect('/user/profile');
    }
};
