import {NextFunction, Request, Response} from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ [GLOBAL ERROR HANDLER]:', err);

    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Внутренняя ошибка сервера';

    res.status(statusCode).json({success: false, status: statusCode, message: message,});
};