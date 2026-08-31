import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import mongoose from 'mongoose';
import apiRouter from './routes/index.js';
import {errorMiddleware} from './middleware/errorMiddleware.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://danaxans_db_user:uZpgyZbyodWl4p61@cluster1.rpijwzp.mongodb.net/autoria?retryWrites=true&w=majority';

mongoose
    .connect(MONGO_URI, {serverSelectionTimeoutMS: 5000})
    .then(() => console.log(' Успешно подключено к MongoDB!'))
    .catch((err) => {
        console.error(' Ошибка MongoDB:', err);
    });
app.use(express.json());
app.use('/api', apiRouter);
app.use(errorMiddleware);

app.listen(5000, () => {
    console.log(' Сервер запущен на http://localhost:5000');
});