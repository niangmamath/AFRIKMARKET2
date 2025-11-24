import express from 'express';
import { getHomePage } from '../controllers/homeController';

const router = express.Router();

// @route   GET /
// @desc    Display the home page
router.get('/', getHomePage);

export default router;
