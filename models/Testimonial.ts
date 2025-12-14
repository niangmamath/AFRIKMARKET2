import { Schema, model, Document } from 'mongoose';

// Interface pour le document Testimonial
export interface ITestimonial extends Document {
    name: string;
    message: string;
    rating: number;
    createdAt: Date;
}

// Schéma Mongoose pour Testimonial
const TestimonialSchema = new Schema<ITestimonial>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Création du modèle
const Testimonial = model<ITestimonial>('Testimonial', TestimonialSchema);

export default Testimonial;
