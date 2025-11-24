
import { Router } from 'express';
import * as blogController from '../controllers/blogController';
import { ensureAuthenticated, ensureAdmin } from '../middleware/authMiddleware';

const router = Router();

// --- ROUTES PUBLIQUES ---

// Afficher tous les articles de blog
router.get('/blog', blogController.getBlogPosts);

// Afficher un article de blog spécifique
router.get('/blog/:id', blogController.getBlogPost);


// --- ROUTES ADMIN ---

// Page principale de gestion du blog dans le dashboard
router.get('/admin/blog', ensureAuthenticated, ensureAdmin, blogController.getAdminBlogPage);

// Afficher le formulaire de création d'un nouvel article
router.get('/admin/blog/new', ensureAuthenticated, ensureAdmin, blogController.getNewBlogPostForm);

// Soumettre le nouvel article
router.post('/admin/blog', ensureAuthenticated, ensureAdmin, blogController.createBlogPost);

// Afficher le formulaire de modification d'un article
router.get('/admin/blog/:id/edit', ensureAuthenticated, ensureAdmin, blogController.getEditBlogPostForm);

// Mettre à jour un article
router.post('/admin/blog/:id/edit', ensureAuthenticated, ensureAdmin, blogController.updateBlogPost);

// Supprimer un article
router.post('/admin/blog/:id/delete', ensureAuthenticated, ensureAdmin, blogController.deleteBlogPost);


export default router;
