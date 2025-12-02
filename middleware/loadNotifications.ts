import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';

/**
 * Middleware pour charger les notifications de l'utilisateur connecté.
 * Attache les notifications et leur nombre total à `res.locals`.
 */
export const loadNotifications = async (req: Request, res: Response, next: NextFunction) => {
    // Vérifie si un utilisateur est connecté
    if (req.session && req.session.userId) {
        try {
            // Récupère toutes les notifications pour l'utilisateur
            const notifications = await Notification.find({ user: req.session.userId })
                .sort({ createdAt: -1 })
                .lean();

            // Attache les notifications et le compte total à res.locals
            res.locals.notifications = notifications;
            res.locals.notificationCount = notifications.length; // Compte total

        } catch (error) {
            console.error("Erreur lors du chargement des notifications:", error);
            res.locals.notifications = [];
            res.locals.notificationCount = 0;
        }
    } else {
        // Si aucun utilisateur n'est connecté, initialise les valeurs par défaut
        res.locals.notifications = [];
        res.locals.notificationCount = 0;
    }

    next();
};
