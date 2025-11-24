
import { Request, Response, NextFunction } from 'express';
import Ad from '../models/Ad';

// Le type global pour req.user est dans index.ts, incluant le rôle

declare module 'express-session' {
    interface SessionData {
        returnTo?: string;
    }
}

// Middleware pour vérifier si un utilisateur est authentifié.
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    req.flash('error_msg', 'Vous devez être connecté pour accéder à cette page.');
    res.redirect('/auth/login');
};

// Middleware pour vérifier si l'utilisateur est un administrateur.
export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
    // La vérification se base maintenant uniquement sur le rôle, ce qui est la bonne pratique.
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Accès non autorisé. Cette section est réservée aux administrateurs.');
    res.redirect('/');
};

// Middleware pour vérifier la propriété de l'annonce.
export const checkAdOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            req.flash('error_msg', 'Vous devez être connecté.');
            return res.redirect('/auth/login');
        }

        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/ads');
        }

        if (!ad.author || ad.author.toString() !== req.user.id.toString()) {
            req.flash('error_msg', 'Action non autorisée.');
            return res.redirect('/ads');
        }

        return next();

    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur serveur lors de la vérification.');
        res.redirect('/ads');
    }
};
