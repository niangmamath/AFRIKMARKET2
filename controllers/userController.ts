import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary } from 'cloudinary';
import User, { IUser } from '../models/User';
import Ad from '../models/Ad';

// @desc    Display user profile page with their ads
// @route   GET /profile
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }

        const userAds = await Ad.find({ author: req.session.userId }).sort({ createdAt: -1 }).lean();

        res.render('user/profile', {
            title: 'Mon Profil',
            user: user,
            ads: userAds,
            errors: []
        });
    } catch (err: any) {
        console.error(err);
        req.flash('error_msg', 'Erreur lors de la récupération du profil.');
        res.redirect('/');
    }
};

// @desc    Update user profile information
// @route   PUT /profile
export const updateUserProfile = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If validation fails, re-render the form with errors
        const user = await User.findById(req.session.userId);
        const userAds = await Ad.find({ author: req.session.userId }).sort({ createdAt: -1 }).lean();
        return res.status(400).render('user/profile', {
            title: 'Mon Profil',
            user: user,
            ads: userAds,
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

        // Update username and email
        user.username = username;
        user.email = email;

        // Handle profile image upload
        if (req.file) {
            // If there's an old image, delete it from Cloudinary
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
        // Handle potential unique field errors (e.g., email already exists)
        if (err.code === 11000) {
            req.flash('error_msg', 'Cet email ou nom d\'utilisateur est déjà pris.');
        } else {
            req.flash('error_msg', 'Erreur lors de la mise à jour du profil.');
        }
        res.redirect('/profile');
    }
};
