import express from 'express';
import { body } from 'express-validator';
import { getUserProfile, updateUserProfile } from '../controllers/userController';
// Correctly import the pre-configured multer instance as the default export
import upload from '../config/cloudinary';
import { ensureAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();

// --- User Profile Routes ---

// @route   GET /profile
// @desc    Show the user's profile page
// @access  Private
router.get('/profile', ensureAuthenticated, getUserProfile);

// @route   PUT /profile
// @desc    Update user profile information
// @access  Private
router.put(
    '/profile',
    ensureAuthenticated,
    // Use the imported upload middleware directly
    upload.single('profileImage'),
    [
        body('username', 'Le nom d\\\'utilisateur ne peut pas être vide.').not().isEmpty().trim(),
        body('email', 'Veuillez fournir un email valide.').isEmail().normalizeEmail()
    ],
    updateUserProfile
);

export default router;
