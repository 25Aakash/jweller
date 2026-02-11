import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jweller_platform';

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI);
        logger.info('✅ MongoDB connected successfully');
    } catch (error) {
        logger.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
    });
};

export const disconnectDatabase = async (): Promise<void> => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
};

export default mongoose;
