
import express, { Router } from 'express';
import * as UserController from '../controllers/userController';
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { upload } from '../config/multer';
import { profileUpdateValidationRules } from '../validators/userValidator'; // Import our new rules

const router: Router = express.Router();

// Route to update user profile, now using the validation rules
router.put(
    '/profile',
    ensureAuthenticated,
    upload.single('profileImage'),
    profileUpdateValidationRules, // Apply the new validation rules
    UserController.updateUserProfile
);

// Route to get the connected user's information
router.get(
    '/profile',
    ensureAuthenticated, 
    UserController.getUserProfile
);

export default router;
