import {NextFunction, Request, Response} from 'express';

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[GLOBAL ERROR HANDLER]:', err);
    const message = err instanceof Error ? err.message : 'Внутрішня помилка сервера';
    res.status(500).json({message});
};
