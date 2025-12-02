import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface pour les attributs de l'utilisateur
export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    createdAt: Date;
    profileImageUrl?: string;       // Restauré
    profileImageFilename?: string;  // Restauré
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    profileImageUrl: { // Restauré
        type: String,
        required: false,
    },
    profileImageFilename: { // Restauré
        type: String,
        required: false,
    },
});

// Middleware pour hasher le mot de passe avant de sauvegarder
userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        if (error instanceof Error) {
            next(error);
        } else {
            next(new Error('Une erreur inconnue est survenue lors du hachage du mot de passe'));
        }
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;
