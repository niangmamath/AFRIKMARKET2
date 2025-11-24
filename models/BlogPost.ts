
import { Schema, model, Document, Types } from 'mongoose';

// Interface décrivant les propriétés d'un article de blog
export interface IBlogPost extends Document {
    title: string;
    content: string;
    author: Types.ObjectId; // Référence à l'auteur (un utilisateur)
    imageUrl?: string; // URL optionnelle pour une image de couverture
    createdAt: Date;
    updatedAt: Date;
}

const BlogPostSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User', // Lie ce champ au modèle User
            required: true,
        },
        imageUrl: {
            type: String,
            required: false,
        },
    },
    { timestamps: true } // Ajoute automatiquement createdAt et updatedAt
);

const BlogPost = model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
