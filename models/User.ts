
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface pour définir la structure du document Utilisateur
export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin'; // Définir les rôles possibles
    profileImageUrl?: string;
    profileImageFilename?: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Veuillez utiliser une adresse e-mail valide.']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Le rôle ne peut être que 'user' ou 'admin'
        default: 'user' // Par défaut, un nouvel utilisateur est un 'user'
    },
    profileImageUrl: {
        type: String,
        default: ''
    },
    profileImageFilename: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// --- Hooks ---
// Hacher le mot de passe avant de sauvegarder l'utilisateur
UserSchema.pre<IUser>('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err: any) {
        next(err);
    }
});

// --- Méthodes ---
// Méthode pour comparer le mot de passe candidat avec le mot de passe haché
UserSchema.methods.comparePassword = function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser>('User', UserSchema);
export default User;
