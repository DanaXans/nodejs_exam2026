import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import {getConfig} from './config.js';
import {errorMiddleware} from './middleware/errorMiddleware.js';
import apiRouter from './routes/index.js';
import {seedDatabase} from './seed/seed.js';

export function createApp() {
    const app = express();
    const {clientUrl} = getConfig();

    app.use(cors({
        origin(origin, callback) {
            if (!origin || origin === clientUrl) {
                callback(null, true);
                return;
            }
            callback(null, false);
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    }));
    app.use(express.json());

    app.get('/', (_req, res) => {
        res.json({
            name: 'AutoRia clone API',
            health: '/api/health',
            docs: 'Дивіться README.md і AutoRia_Postman_Collection.json',
        });
    });

    app.use('/api', apiRouter);

    app.use((_req, res) => {
        res.status(404).json({message: 'Маршрут не знайдено'});
    });
    app.use(errorMiddleware);

    return app;
}

export async function connectDatabase(): Promise<void> {
    const {mongoUri} = getConfig();
    if (!mongoUri) {
        throw new Error('MONGO_URI is not defined');
    }

    const attempts = 20;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            await mongoose.connect(mongoUri);
            console.log('Підключено до MongoDB');
            return;
        } catch (error) {
            console.error(`MongoDB недоступна, спроба ${attempt}/${attempts}`);
            if (attempt === attempts) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}

export async function initDatabase(): Promise<void> {
    await connectDatabase();
    await seedDatabase();
    console.log('Початкові дані перевірено');
}
