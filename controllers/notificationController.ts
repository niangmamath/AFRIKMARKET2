import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';

/**
 * @desc    Marquer toutes les notifications non lues d'un utilisateur comme lues.
 * @route   POST /notifications/mark-as-read
 * @access  Private
 */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    // Vérifie si un utilisateur est connecté
    if (!req.user) {
        // Si aucun utilisateur n'est connecté, on renvoie une erreur ou on redirige.
        // Ici, on redirige simplement vers la page d'accueil.
        return res.redirect('/');
    }

    try {
        // Met à jour toutes les notifications de cet utilisateur qui ne sont pas encore lues
        await Notification.updateMany(
            { user: req.user.id, isRead: false }, // Critères de recherche
            { $set: { isRead: true } }             // Mise à jour à appliquer
        );

        // Redirige l'utilisateur vers la page d'où il vient.
        // req.get('Referrer') récupère l'URL de la page précédente.
        const redirectUrl = req.get('Referrer') || '/';
        res.redirect(redirectUrl);

    } catch (error) {
        console.error("Erreur lors de la mise à jour des notifications :", error);
        // En cas d'erreur, on passe au middleware de gestion des erreurs
        next(error);
    }
};
