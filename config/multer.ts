
import multer from 'multer';

// Configuration de base pour stocker les fichiers en mémoire tampon (buffer)
const storage = multer.memoryStorage();

/**
 * Instance de base de Multer. Permet une configuration flexible dans les routes.
 * C'est la méthode à utiliser pour les téléversements simples.
 * @example multerUpload.single('profileImage')
 */
export const multerUpload = multer({ storage: storage });

/**
 * Middleware Multer pré-configuré pour gérer le téléversement de plusieurs fichiers (jusqu'à 6)
 * depuis un champ de formulaire nommé 'images'.
 * C'est la solution recommandée pour le cas des annonces.
 */
export const handleMultiUpload = multer({
    storage: storage,
    limits: { files: 6 } // Limite le nombre de fichiers
}).array('images', 6);
