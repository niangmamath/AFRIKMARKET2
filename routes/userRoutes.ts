import express, { Router } from 'express';
import * as UserController from '../controllers/userController';
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { upload } from '../config/multer';
import { profileUpdateValidationRules } from '../validators/userValidator';

// Debugging log to confirm file is loaded
console.log('--- Initializing user routes ---');

const router: Router = express.Router();

// Route to get the connected user's own profile
// IMPORTANT: This must come before the /:id route
router.get(
    '/profile',
    ensureAuthenticated, 
    UserController.getUserProfile
);

// Route to get a public user profile
router.get(
    '/:id',
    UserController.getPublicUserProfile
);

// Route to update user profile
router.put(
    '/profile',
    ensureAuthenticated,
    upload.single('profileImage'),
    profileUpdateValidationRules,
    UserController.updateUserProfile
);

export default router;
