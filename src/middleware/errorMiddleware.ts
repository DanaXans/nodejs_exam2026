import {NextFunction, Request, Response} from 'express';
import {HttpError} from '../errors/HttpError.js';

interface MongoLikeError extends Error {
    code?: number;
    status?: number;
    statusCode?: number;
}

export const errorMiddleware = (err: MongoLikeError, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({message: err.message});
    }

    if (err.code === 11000) {
        return res.status(409).json({message: 'Такий запис вже існує'});
    }

    if (err.name === 'CastError') {
        return res.status(400).json({message: 'Некоректний ідентифікатор'});
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({message: err.message});
    }

    console.error('[error]', err);
    return res.status(err.status || err.statusCode || 500).json({
        message: 'Внутрішня помилка сервера',
    });
};
