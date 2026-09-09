import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/index.js';
import {errorMiddleware} from './middleware/errorMiddleware.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env');
}

const app = express();

app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({status: 'ok'});
});

app.use('/api', apiRouter);
app.use(errorMiddleware);

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Успішно підключено до MongoDB');

        app.listen(PORT, () => {
            console.log(`Сервер запущено на http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Не вдалося запустити сервер:', error);
        process.exit(1);
    }
};

void startServer();
