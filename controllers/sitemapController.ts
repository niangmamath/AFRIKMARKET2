import { Request, Response } from 'express';
import { SitemapStream, streamToPromise, SitemapItemLoose, EnumChangefreq } from 'sitemap';
import { Readable } from 'stream';
import Ad from '../models/Ad';

export const generateSitemap = async (req: Request, res: Response) => {
    try {
        const links: SitemapItemLoose[] = [
            { url: '/', changefreq: EnumChangefreq.DAILY, priority: 1.0 },
            // Ajoutez d'autres pages statiques ici si nécessaire
            // { url: '/a-propos', changefreq: EnumChangefreq.MONTHLY, priority: 0.7 },
        ];

        const approvedAds = await Ad.find({ status: 'approved' }).sort({ createdAt: -1 });

        for (const ad of approvedAds) {
            links.push({
                url: `/ads/${ad._id}`,
                changefreq: EnumChangefreq.WEEKLY,
                priority: 0.8,
                lastmod: ad.updatedAt.toISOString(), // Utilise la date de mise à jour de l'annonce
            });
        }

        const stream = new SitemapStream({ hostname: 'https://' + req.headers.host });

        res.setHeader('Content-Type', 'application/xml');
        
        const readableStream = Readable.from(links);
        const sitemap = await streamToPromise(readableStream.pipe(stream));
        
        res.send(sitemap.toString());

    } catch (error) {
        console.error('Erreur lors de la génération du sitemap:', error);
        res.status(500).send('Erreur serveur');
    }
};
