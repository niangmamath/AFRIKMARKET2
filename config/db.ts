import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('FATAL ERROR: MONGO_URI is not defined in the environment variables.');
        process.exit(1); // Exit process with failure code
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', (err as Error).message);
        process.exit(1);
    }
};

export default connectDB;
