import { Schema, model, Document } from 'mongoose';
import { IUser } from './User'; // Assurez-vous que le chemin est correct

// Interface pour un document de Blog
export interface IBlog extends Document {
    title: string;
    content: string;
    author: IUser['_id']; // Référence à un utilisateur
    createdAt: Date;
}

// Schéma Mongoose pour le Blog
const BlogSchema = new Schema<IBlog>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Création du modèle
const Blog = model<IBlog>('Blog', BlogSchema);

export default Blog;
