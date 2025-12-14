
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';
import User from '../models/User';
import Ad from '../models/Ad';

const uploadToCloudinary = (file: Express.Multer.File): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ folder: 'afrikmarket_profiles' }, (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Cloudinary upload failed.'));
            resolve(result);
        });
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
};

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const profileUser = await User.findById(req.session.userId).lean();
        if (!profileUser) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }
        const userAds = await Ad.find({ author: profileUser._id }).sort({ createdAt: -1 }).lean();

        const approvedAds = userAds.filter(ad => ad.status === 'approved');
        const pendingAds = userAds.filter(ad => ad.status === 'pending');
        const rejectedAds = userAds.filter(ad => ad.status === 'rejected');
        
        res.render('user/profile', { 
            title: 'Mon Profil', 
            profileUser, 
            isPublicProfile: false, 
            approvedAds, 
            pendingAds, 
            rejectedAds, 
            errors: [] 
        });
    } catch (err: any) { 
        console.error("Error in getUserProfile:", err);
        req.flash('error_msg', 'Une erreur est survenue lors du chargement du profil.');
        res.redirect('/');
     }
};

export const getPublicUserProfile = async (req: Request, res: Response) => {
    try {
        if (req.session.userId && req.params.id === req.session.userId.toString()) return res.redirect('/user/profile');
        const profileUser = await User.findById(req.params.id).lean();
        if (!profileUser) return res.redirect('/');
        
        const userAds = await Ad.find({ author: profileUser._id, status: 'approved' }).sort({ createdAt: -1 }).lean();

        res.render('user/profile', { 
            title: `Profil de ${profileUser.username}`, 
            profileUser, 
            isPublicProfile: true, 
            approvedAds: userAds, 
            pendingAds: [], 
            rejectedAds: [], 
            errors: [] 
        });
    } catch (err: any) { 
        console.error("Error in getPublicUserProfile:", err);
        res.redirect('/'); 
    }
};

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.flash('error_msg', 'Utilisateur non trouvé.');
            return res.redirect('/');
        }

        user.username = req.body.username;
        user.email = req.body.email;

        if (req.file) {
            if (user.profileImageFilename) {
                await cloudinary.uploader.destroy(user.profileImageFilename);
            }
            const result = await uploadToCloudinary(req.file);
            user.profileImageUrl = result.secure_url;
            user.profileImageFilename = result.public_id;
        }

        await user.save();

        req.flash('success_msg', 'Profil mis à jour avec succès !');
        res.redirect('/user/profile');

    } catch (err: any) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        req.flash('error_msg', 'Une erreur est survenue lors de la mise à jour.');
        res.redirect('/user/profile');
    }
};
