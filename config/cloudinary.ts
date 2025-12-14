
import { v2 as cloudinary } from 'cloudinary';

/**
 * Initialise la configuration de Cloudinary.
 * Doit être appelée explicitement au démarrage de l'application.
 */
export const configureCloudinary = () => {
    // Vérification que les variables d'environnement nécessaires sont présentes
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.warn('[AFRIKMARKET WARNING] ⚠️  Les variables d\'environnement Cloudinary ne sont pas entièrement définies. Le téléversement échouera.');
    }

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true // Toujours utiliser HTTPS
    });
    console.log('[AFRIKMARKET LOG] ☁️  Cloudinary a été configuré.');
};

// Exporte l'instance de cloudinary pour être utilisée dans l'application
export default cloudinary;
