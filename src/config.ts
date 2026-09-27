import dotenv from 'dotenv';

dotenv.config();

export function getConfig() {
    return {
        port: Number(process.env.PORT) || 5000,
        mongoUri: process.env.MONGO_URI || '',
        jwtSecret: process.env.JWT_SECRET || 'secret_key',
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    };
}
