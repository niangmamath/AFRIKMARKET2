
import { Router } from 'express';
import * as blogController from '../controllers/blogController';
import { ensureAuthenticated, ensureAdmin } from '../middleware/authMiddleware';

const router = Router();

// --- ROUTES PUBLIQUES ---

// Afficher tous les articles de blog
// Route: GET /blog
router.get('/', blogController.getBlogPosts);

// Afficher un article de blog spécifique
// Route: GET /blog/:id
router.get('/:id', blogController.getBlogPost);


// Les routes d'administration pour le blog ont été déplacées vers adminRoutes.ts pour une meilleure organisation.

export default router;
