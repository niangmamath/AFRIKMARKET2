
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import path from 'path';
import methodOverride from 'method-override';
import flash from 'connect-flash';
import { SitemapStream, streamToPromise } from 'sitemap';
import { createGzip } from 'zlib';
import Ad from './models/Ad';

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

const app = express();

// Faites confiance au premier proxy devant l'application. Essentiel pour le cookie "secure" en production.
app.set('trust proxy', 1);

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
    res.locals.currentPath = req.path;

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


// --- Sitemap Route ---
let sitemap: Buffer | undefined;
app.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  // if we have a cached sitemap, send it
  if (sitemap) {
    return res.send(sitemap);
  }

  try {
    const smStream = new SitemapStream({ hostname: 'https://afrikmarket.com' }); // Change to your domain
    const pipeline = smStream.pipe(createGzip());

    // Add any static pages
    smStream.write({ url: '/',  changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/ads',  changefreq: 'daily',  priority: 0.8 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.7 });
    smStream.write({ url: '/auth/login',  changefreq: 'monthly', priority: 0.4 });
    smStream.write({ url: '/auth/register',  changefreq: 'monthly', priority: 0.4 });

    // Add dynamic pages, e.g., from a database
    const ads = await Ad.find();
    ads.forEach(ad => {
      smStream.write({
        url: `/ads/${ad._id}`,
        changefreq: 'weekly',
        priority: 0.6,
        lastmod: ad.updatedAt
      });
    });
    
    smStream.end();

    // cache the sitemap
    streamToPromise(pipeline).then((sm: any) => sitemap = sm);
    // stream the response
    pipeline.pipe(res).on('error', (e: any) => {throw e;});
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});


// --- Routes ---
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use(userRoutes);
app.use('/blog', blogRoutes);
app.use('/admin', adminRoutes);

export default app;
