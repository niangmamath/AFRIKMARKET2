
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import path from 'path';
import methodOverride from 'method-override';
import flash from 'connect-flash';

// Import models
import User, { IUser } from './models/User';

// Import routes
import authRoutes from './routes/authRoutes';
import adRoutes from './routes/adRoutes';
import homeRoutes from './routes/homeRoutes';
import userRoutes from './routes/userRoutes';
import blogRoutes from './routes/blogRoutes';
import adminRoutes from './routes/adminRoutes'; 

// Augmenter le type Request de Express pour inclure l'utilisateur
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

// Load environment variables
dotenv.config();

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// --- View Engine Setup ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- Session Management ---
declare module 'express-session' {
    interface SessionData {
        userId?: string;
    }
}
const sessionSecret = process.env.SESSION_SECRET || 'a-very-strong-secret-key';
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/leboncoin';

// Conditionally create MongoStore only if not in a test environment
const store = process.env.NODE_ENV === 'test' 
    ? undefined 
    : MongoStore.create({ mongoUrl: mongoUri });

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 24 }
}));

// Flash middleware
app.use(flash());

// Middleware global
app.use(async (req: Request, res: Response, next: NextFunction) => {
    res.locals.isAuthenticated = !!req.session.userId;
    
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select('-password');
            if (user) {
                req.user = user; 
                res.locals.user = user; 
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            req.user = undefined;
            res.locals.user = null;
        }
    }

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');

    next();
});

// --- Routes ---
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use(userRoutes);
app.use(blogRoutes);
app.use('/admin', adminRoutes);

export default app;
