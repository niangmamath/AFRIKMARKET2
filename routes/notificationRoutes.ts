import { Router } from 'express';
import { markAllAsRead } from '../controllers/notificationController';
import { ensureAuthenticated } from '../middleware/authMiddleware'; // Corrigé: isAuthenticated -> ensureAuthenticated

const router = Router();

/**
 * @route   POST /notifications/mark-as-read
 * @desc    Route pour marquer toutes les notifications comme lues.
 * @access  Private
 */
router.post('/mark-as-read', ensureAuthenticated, markAllAsRead); // Corrigé ici aussi

export default router;
