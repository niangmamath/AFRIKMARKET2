import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';

// @desc    Affiche le formulaire d'inscription
// @route   GET /auth/register
export const getRegister = (req: Request, res: Response) => {
    res.render('auth/register', {
        title: 'Inscription',
        errors: [],
        oldInput: { username: '', email: '' } 
    });
};

// @desc    Gère l'inscription de l'utilisateur
// @route   POST /auth/register
export const postRegister = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/register', {
            title: 'Inscription',
            errors: errors.array(),
            oldInput: { username: req.body.username, email: req.body.email } 
        });
    }

    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            req.flash('error_msg', 'L\\\'e-mail ou le nom d\\\'utilisateur existe déjà.');
             return res.status(400).render('auth/register', {
                title: 'Inscription',
                errors: [{ msg: 'L\\\'e-mail ou le nom d\\\'utilisateur existe déjà.' }],
                oldInput: { username: req.body.username, email: req.body.email }
            });
        }
        
        // Générer un avatar par défaut unique basé sur le nom d'utilisateur
        const avatarSeed = encodeURIComponent(username);
        const defaultAvatarUrl = `https://api.dicebear.com/8.x/adventurer/svg?seed=${avatarSeed}`;

        const newUser = new User({
            username,
            email,
            password,
            profileImageUrl: defaultAvatarUrl, // Assigner l'avatar par défaut
        });

        await newUser.save();

        req.flash('success_msg', 'Vous êtes maintenant inscrit et pouvez vous connecter.');
        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur du serveur');
    }
};

// @desc    Affiche le formulaire de connexion
// @route   GET /auth/login
export const getLogin = (req: Request, res: Response) => {
    res.render('auth/login', {
        title: 'Connexion',
        errors: [],
        oldInput: { email: '' } 
    });
};

// @desc    Gère la connexion de l'utilisateur
// @route   POST /auth/login
export const postLogin = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/login', {
            title: 'Connexion',
            errors: errors.array(),
            oldInput: { email: req.body.email } 
        });
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
             return res.status(400).render('auth/login', {
                title: 'Connexion',
                errors: [{ msg: 'E-mail ou mot de passe invalide.' }],
                oldInput: { email: req.body.email }
            });
        }

        req.session.userId = user._id.toString();

        req.flash('success_msg', 'Connexion réussie !');
        res.redirect('/');

    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur du serveur');
    }
};

// @desc    Gère la déconnexion de l'utilisateur
// @route   POST /auth/logout
export const logout = (req: Request, res: Response) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Erreur de déconnexion : ", err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/auth/login');
    });
};
