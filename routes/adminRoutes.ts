import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as blogController from '../controllers/blogController';
import { ensureAuthenticated, ensureAdmin } from '../middleware/authMiddleware';

const router = Router();

// @desc    Page principale du tableau de bord
// @route   GET /admin
// @access  Private (Admin)
router.get('/', ensureAuthenticated, ensureAdmin, adminController.getDashboard);

// --- Gestion des annonces ---
// @desc    Page de gestion des annonces
// @route   GET /admin/ads
// @access  Private (Admin)
router.get('/ads', ensureAuthenticated, ensureAdmin, adminController.getAds);

// @desc    Approuver une annonce
// @route   POST /admin/ads/:id/approve
// @access  Private (Admin)
router.post('/ads/:id/approve', ensureAuthenticated, ensureAdmin, adminController.approveAd);

// @desc    Rejeter une annonce
// @route   POST /admin/ads/:id/reject
// @access  Private (Admin)
router.post('/ads/:id/reject', ensureAuthenticated, ensureAdmin, adminController.rejectAd);

// --- Gestion des utilisateurs ---
// @desc    Page de gestion des utilisateurs
// @route   GET /admin/users
// @access  Private (Admin)
router.get('/users', ensureAuthenticated, ensureAdmin, adminController.getUsers);

// @desc    Promouvoir un utilisateur au rang d'administrateur
// @route   POST /admin/users/:id/promote
// @access  Private (Admin)
router.post('/users/:id/promote', ensureAuthenticated, ensureAdmin, adminController.promoteUser);

// @desc    Rétrograder un administrateur au rang d'utilisateur
// @route   POST /admin/users/:id/demote
// @access  Private (Admin)
router.post('/users/:id/demote', ensureAuthenticated, ensureAdmin, adminController.demoteUser);

// @desc    Supprimer un utilisateur
// @route   DELETE /admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', ensureAuthenticated, ensureAdmin, adminController.deleteUser);

// --- Gestion du Blog ---
// @desc    Page de gestion des articles de blog
// @route   GET /admin/blog
// @access  Private (Admin)
router.get('/blog', ensureAuthenticated, ensureAdmin, blogController.getAdminBlogPage);

// @desc    Afficher le formulaire de création d'un nouvel article
// @route   GET /admin/blog/new
// @access  Private (Admin)
router.get('/blog/new', ensureAuthenticated, ensureAdmin, blogController.getNewBlogPostForm);

// @desc    Soumettre le nouvel article
// @route   POST /admin/blog
// @access  Private (Admin)
router.post('/blog', ensureAuthenticated, ensureAdmin, blogController.createBlogPost);

// @desc    Afficher le formulaire de modification d'un article
// @route   GET /admin/blog/:id/edit
// @access  Private (Admin)
router.get('/blog/:id/edit', ensureAuthenticated, ensureAdmin, blogController.getEditBlogPostForm);

// @desc    Mettre à jour un article
// @route   POST /admin/blog/:id/edit
// @access  Private (Admin)
router.post('/blog/:id/edit', ensureAuthenticated, ensureAdmin, blogController.updateBlogPost);

// @desc    Supprimer un article
// @route   DELETE /admin/blog/:id
// @access  Private (Admin)
router.post('/blog/:id/delete', ensureAuthenticated, ensureAdmin, blogController.deleteBlogPost);

export default router;
