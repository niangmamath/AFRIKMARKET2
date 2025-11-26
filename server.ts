import dotenv from 'dotenv';
dotenv.config();

// =================================================================
// TRÈS TÔT DANS LE DÉMARRAGE. Si vous ne voyez pas ça, l'app ne se lance pas.
console.log(`[AFRIKMARKET LOG] Exécution de server.ts commencée à ${new Date().toISOString()}`);
console.log(`[AFRIKMARKET LOG] NODE_ENV: ${process.env.NODE_ENV}`);
// =================================================================

// On vérifie MONGO_URI *avant* d'importer un autre code qui pourrait l'utiliser.
const mongoUriForCheck = process.env.MONGO_URI;
console.log('[AFRIKMARKET LOG] Vérification de MONGO_URI...');
if (mongoUriForCheck) {
    console.log('[AFRIKMARKET LOG] MONGO_URI est présent.');
    // On log une partie non sensible pour confirmer le format
    console.log(`[AFRIKMARKET LOG] Format de MONGO_URI: ${mongoUriForCheck.substring(0, 15)}...`);
} else {
    // Si la variable est absente, on quitte immédiatement.
    console.error('[AFRIKMARKET LOG] FATAL: MONGO_URI n\'est pas trouvé dans process.env. L\'application ne peut pas démarrer.');
    process.exit(1);
}
// =================================================================

console.log('[AFRIKMARKET LOG] Les imports vont être traités...');
import app from './index';
import connectDB from './config/db';
console.log('[AFRIKMARKET LOG] Imports traités avec succès.');


const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  console.log('[AFRIKMARKET LOG] Démarrage du serveur et connexion à la base de données...');
  (async () => {
    // La fonction connectDB a déjà ses propres logs
    await connectDB();
    
    app.listen(port, () => {
      console.log(`[AFRIKMARKET LOG] Le serveur écoute sur le port ${port}`);
    });
  })().catch(err => {
      console.error('[AFRIKMARKET LOG] Erreur non gérée pendant le démarrage asynchrone du serveur:', err);
      process.exit(1);
  });
}
