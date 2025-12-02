import { Schema, model, Document } from 'mongoose';

// Interface pour les attributs de la notification
export interface INotification extends Document {
    user: Schema.Types.ObjectId; // L'utilisateur qui reçoit la notification
    message: string;             // Le contenu du message de notification
    isRead: boolean;             // Statut de lecture (lu/non lu)
    link?: string;                // Un lien optionnel (par ex. vers l'annonce approuvée)
    createdAt: Date;             // Date de création
}

const notificationSchema = new Schema<INotification>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Index pour accélérer les requêtes de recherche de notifications par utilisateur
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Notification = model<INotification>('Notification', notificationSchema);

export default Notification;
