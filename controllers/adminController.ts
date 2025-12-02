import { Request, Response, NextFunction } from 'express';
import Ad from '../models/Ad';
import User from '../models/User';
import Blog from '../models/Blog';
import Notification from '../models/Notification'; // Importer le modèle Notification

/**
 * @desc    Affiche la page principale du tableau de bord avec des statistiques et des graphiques
 * @route   GET /admin
 * @access  Private (Admin)
 */
export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // --- Statistiques générales ---
        const totalAds = await Ad.countDocuments();
        const pendingAds = await Ad.countDocuments({ status: 'pending' });
        const totalUsers = await User.countDocuments();
        const totalBlogs = await Blog.countDocuments();

        // --- Données pour le graphique des utilisateurs ---
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const usersByMonthRaw = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        const usersByMonth = usersByMonthRaw.map(item => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            count: item.count
        }));

        // --- Données pour le graphique des annonces ---
        const adsByStatus = await Ad.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ]);

        res.render('admin/dashboard', {
            title: 'Tableau de bord',
            stats: {
                totalAds,
                pendingAds,
                totalUsers,
                totalBlogs,
                usersByMonth, // Données pour le graphique des utilisateurs
                adsByStatus   // Données pour le graphique des annonces
            }
        });
    } catch (error) {
        next(error);
    }
};


// --- Gestion des Annonces ---

/**
 * @desc    Affiche la page de gestion des annonces
 * @route   GET /admin/ads
 * @access  Private (Admin)
 */
export const getAds = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const statusFilter = req.query.status;
        const query = statusFilter ? { status: statusFilter } : {};
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalAds = await Ad.countDocuments(query);
        const totalPages = Math.ceil(totalAds / limit);

        const ads = await Ad.find(query).populate('author', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.render('admin/ads/index', {
            title: 'Gérer les annonces',
            layout: 'layouts/admin',
            ads: ads,
            currentStatus: statusFilter,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Approuver une annonce
 * @route   POST /admin/ads/:id/approve
 * @access  Private (Admin)
 */
export const approveAd = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/admin/ads');
        }
        ad.status = 'approved';
        await ad.save();

        // Créer une notification pour l'auteur de l'annonce
        if (ad.author) {
            const notification = new Notification({
                user: ad.author, // ID de l'auteur
                message: `Votre annonce "${ad.title}" a été approuvée.`,
                link: `/ads/${ad._id}` // Lien direct vers l'annonce
            });
            await notification.save();
        }

        req.flash('success_msg', 'Annonce approuvée avec succès.');
        res.redirect('/admin/ads?status=pending');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Rejeter une annonce
 * @route   POST /admin/ads/:id/reject
 * @access  Private (Admin)
 */
export const rejectAd = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ad = await Ad.findById(req.params.id);
        if (!ad) {
            req.flash('error_msg', 'Annonce non trouvée.');
            return res.redirect('/admin/ads');
        }
        ad.status = 'rejected';
        await ad.save();

        // Créer une notification de rejet pour l'auteur de l'annonce
        if (ad.author) {
            const notification = new Notification({
                user: ad.author, // ID de l'auteur
                message: `Votre annonce "${ad.title}" a été rejetée.`
                // Pas de lien car l'annonce n'est pas accessible
            });
            await notification.save();
        }

        req.flash('success_msg', 'Annonce rejetée avec succès.');
        res.redirect('/admin/ads?status=pending');
    } catch (error) {
        next(error);
    }
};

// --- Gestion des Utilisateurs ---

/**
 * @desc    Affiche la page de gestion des utilisateurs
 * @route   GET /admin/users
 * @access  Private (Admin)
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.render('admin/users/index', {
            title: 'Gérer les utilisateurs',
            layout: 'layouts/admin',
            users: users,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Promouvoir un utilisateur au rang d'administrateur
 * @route   POST /admin/users/:id/promote
 * @access  Private (Admin)
 */
export const promoteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user && req.user.id === req.params.id) {
            req.flash('error_msg', 'Vous ne pouvez pas modifier votre propre rôle.');
            return res.redirect('/admin/users');
        }
        await User.findByIdAndUpdate(req.params.id, { role: 'admin' });
        req.flash('success_msg', 'Utilisateur promu administrateur.');
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Rétrograder un administrateur au rang d'utilisateur
 * @route   POST /admin/users/:id/demote
 * @access  Private (Admin)
 */
export const demoteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user && req.user.id === req.params.id) {
            req.flash('error_msg', 'Vous ne pouvez pas modifier votre propre rôle.');
            return res.redirect('/admin/users');
        }
        await User.findByIdAndUpdate(req.params.id, { role: 'user' });
        req.flash('success_msg', 'Administrateur rétrogradé utilisateur.');
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Supprimer un utilisateur
 * @route   DELETE /admin/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        if (req.user && req.user.id === userId) {
            req.flash('error_msg', 'Vous ne pouvez pas supprimer votre propre compte.');
            return res.redirect('/admin/users');
        }

        await Ad.deleteMany({ author: userId });
        await User.findByIdAndDelete(userId);
        req.flash('success_msg', 'Utilisateur et ses annonces supprimés.');
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
};

// --- Gestion du Blog ---

/**
 * @desc    Affiche la page de gestion des articles de blog
 * @route   GET /admin/blog
 * @access  Private (Admin)
 */
export const getBlogPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const blogs = await Blog.find().populate('author', 'username').sort({ createdAt: -1 });
        res.render('admin/blog/index', {
            title: 'Gérer le blog',
            layout: 'layouts/admin',
            blogs: blogs
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Supprimer un article de blog
 * @route   DELETE /admin/blog/:id
 * @access  Private (Admin)
 */
export const deleteBlogPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Article de blog supprimé avec succès.');
        res.redirect('/admin/blog');
    } catch (error) {
        next(error);
    }
};
