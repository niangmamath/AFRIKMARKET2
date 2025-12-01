
import mongoose, { Schema, model, Document, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Interface pour le document Ad
export interface IAd extends Document {
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    imageFilename?: string;
    author: Types.ObjectId | Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    status: 'pending' | 'approved' | 'rejected';
}

const AdSchema = new Schema<IAd>({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: false },
    imageFilename: { type: String, required: false },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        required: true
    }
}, { timestamps: true });

// Appliquer le plugin de pagination au schéma
AdSchema.plugin(mongoosePaginate);

// L'astuce est de faire un "cast" du modèle pour inclure le type de pagination
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Ad = model<IAd, mongoose.PaginateModel<IAd>>('Ad', AdSchema, "ads" as any);

export default Ad;
