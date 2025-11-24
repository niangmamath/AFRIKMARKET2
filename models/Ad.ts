
import { Schema, model, Document, Types, PaginateModel } from 'mongoose';
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
    status: 'pending' | 'approved' | 'rejected';
}

// Interface pour le modèle Ad avec pagination
interface IAdModel extends PaginateModel<IAd> {}

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

// Utiliser l'interface IAdModel pour le typage du modèle
const Ad = model<IAd, IAdModel>('Ad', AdSchema);

export default Ad;
