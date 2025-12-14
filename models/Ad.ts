
import mongoose, { Schema, model, Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Interface pour le document Ad
export interface IAd extends Document {
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrls: string[];
    imageUrl?: string;
    affiliateLink?: string; // Ajout du champ pour le lien d'affiliation
    imageFilenames: string[];
    imageFilename?: string;
    author: Types.ObjectId | Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
    location: string;
    phoneNumber: string;
    displayImage: string; // Propriété virtuelle
}

const AdSchema = new Schema<IAd>({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrls: [{ type: String }],
    imageUrl: { type: String },
    affiliateLink: { type: String, trim: true }, // Ajout au schéma
    imageFilenames: [{ type: String }],
    imageFilename: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    },
    location: { type: String, required: true },
    phoneNumber: { type: String, required: true },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Définition de la propriété virtuelle
AdSchema.virtual('displayImage').get(function() {
    if (this.imageUrls && this.imageUrls.length > 0) {
        return this.imageUrls[0];
    }
    if (this.imageUrl) {
        return this.imageUrl;
    }
    return 'https://via.placeholder.com/300x200.png?text=Pas+d\'image';
});

// Appliquer le plugin de pagination au schéma
AdSchema.plugin(mongoosePaginate);

const Ad = model<IAd, mongoose.PaginateModel<IAd>>('Ad', AdSchema);

export default Ad;
