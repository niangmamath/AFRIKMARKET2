import { Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import User from '../models/User'; // Pour peupler l'auteur

// --- FONCTIONS PUBLIQUES ---

/**
 * @desc    Afficher tous les articles du blog
 * @route   GET /blog
 * @access  Public
 */
export const getBlogPosts = async (req: Request, res: Response) => {
    try {
        const posts = await BlogPost.find({}).sort({ createdAt: -1 }).populate('author', 'username');
        res.render('blog/index', { 
            title: 'Blog', 
            posts 
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

/**
 * @desc    Afficher un article de blog spécifique
 * @route   GET /blog/:id
 * @access  Public
 */
export const getBlogPost = async (req: Request, res: Response) => {
    try {
        const post = await BlogPost.findById(req.params.id).populate('author', 'username profileImageUrl');
        if (!post) {
            req.flash('error_msg', 'Article non trouvé');
            return res.redirect('/blog');
        }
        res.render('blog/show', { 
            title: post.title, 
            post 
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};


// --- FONCTIONS ADMIN ---

/**
 * @desc    Afficher la page de gestion du blog pour l'admin
 * @route   GET /admin/blog
 * @access  Private (Admin)
 */
export const getAdminBlogPage = async (req: Request, res: Response) => {
    try {
        const posts = await BlogPost.find({}).sort({ createdAt: -1 }).populate('author', 'username');
        res.render('admin/blog/index', {
            title: 'Gestion du Blog',
            blogs: posts, // Correction: passer 'posts' en tant que 'blogs'
            layout: 'layouts/admin' // Utiliser un layout spécifique pour l'admin
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

/**
 * @desc    Afficher le formulaire de création d'un article
 * @route   GET /admin/blog/new
 * @access  Private (Admin)
 */
export const getNewBlogPostForm = (req: Request, res: Response) => {
    res.render('admin/blog/new', {
        title: 'Nouvel Article',
        layout: 'layouts/admin'
    });
};

/**
 * @desc    Créer un nouvel article de blog
 * @route   POST /admin/blog
 * @access  Private (Admin)
 */
export const createBlogPost = async (req: Request, res: Response) => {
    const { title, content, imageUrl } = req.body;

    if (!title || !content) {
        req.flash('error_msg', 'Le titre et le contenu sont obligatoires.');
        return res.redirect('/admin/blog/new');
    }

    try {
        const newPost = new BlogPost({
            title,
            content,
            imageUrl,
            author: (req.user as any)?._id
        });

        await newPost.save();
        req.flash('success_msg', 'Article créé avec succès.');
        res.redirect('/admin/blog');

    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', "Erreur lors de la création de l'article.");
        res.redirect('/admin/blog/new');
    }
};

/**
 * @desc    Afficher le formulaire d'édition d'un article
 * @route   GET /admin/blog/:id/edit
 * @access  Private (Admin)
 */
export const getEditBlogPostForm = async (req: Request, res: Response) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            req.flash('error_msg', 'Article non trouvé');
            return res.redirect('/admin/blog');
        }
        res.render('admin/blog/edit', {
            title: "Modifier l'article",
            post,
            layout: 'layouts/admin'
        });
    } catch (err: any) {
        console.error(err.message);
        res.redirect('/admin/blog');
    }
};

/**
 * @desc    Mettre à jour un article de blog
 * @route   POST /admin/blog/:id/edit
 * @access  Private (Admin)
 */
export const updateBlogPost = async (req: Request, res: Response) => {
    const { title, content, imageUrl } = req.body;

    try {
        const post = await BlogPost.findByIdAndUpdate(req.params.id, {
            title,
            content,
            imageUrl
        }, { new: true });

        if (!post) {
            req.flash('error_msg', 'Article non trouvé');
            return res.redirect('/admin/blog');
        }

        req.flash('success_msg', 'Article mis à jour avec succès.');
        res.redirect('/admin/blog');

    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur lors de la mise à jour.');
        res.redirect(`/admin/blog/${req.params.id}/edit`);
    }
};

/**
 * @desc    Supprimer un article de blog
 * @route   POST /admin/blog/:id/delete
 * @access  Private (Admin)
 */
export const deleteBlogPost = async (req: Request, res: Response) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        
        if (!post) {
            req.flash('error_msg', 'Article non trouvé.');
            return res.redirect('/admin/blog');
        }

        req.flash('success_msg', 'Article supprimé avec succès.');
        res.redirect('/admin/blog');

    } catch (err: any) {
        console.error(err.message);
        req.flash('error_msg', 'Erreur lors de la suppression.');
        res.redirect('/admin/blog');
    }
};