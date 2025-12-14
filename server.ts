
// Charge les variables d'environnement. DOIT ÊTRE LA TOUTE PREMIÈRE LIGNE.
import 'dotenv/config';

// Imports principaux
import app from './index';
import connectDB from './config/db';

// Le port est défini par l'environnement ou 3000 par défaut
const port = process.env.PORT || 3000;

// Démarrage du serveur en production/développement
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      // Connexion à la base de données
      await connectDB(); 
      
      // Démarrage du serveur Express
      app.listen(port, () => {
        console.log(`[AFRIKMARKET LOG] ✅ Serveur prêt ! Visitez http://localhost:${port}`);
      });

    } catch (err) {
      console.error('[AFRIKMARKET LOG] Erreur fatale au démarrage du serveur:', err);
      process.exit(1);
    }
  })();
}
