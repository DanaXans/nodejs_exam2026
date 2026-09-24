import {NextFunction, Request, Response} from 'express';
import {CAR_BRANDS} from '../data/brands.js';
import {BrandRequest} from '../models/BrandRequest.js';
import {AuthRequest} from '../middleware/authMiddleware.js';

export const getBrands = (_req: Request, res: Response) => {
    res.json(CAR_BRANDS);
};

export const reportMissingBrand = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const make = String(req.body?.make ?? '').trim();
        const model = String(req.body?.model ?? '').trim();
        if (!make) {
            return res.status(400).json({message: 'Вкажіть марку, якої немає в списку'});
        }
        if (!req.user?.userId) {
            return res.status(401).json({message: 'Не авторизовано'});
        }

        const report = await BrandRequest.create({
            make,
            model,
            sellerId: req.user.userId,
        });

        return res.status(201).json({
            id: String(report._id),
            make: report.make,
            model: report.model,
            message: 'Запит надіслано адміністратору',
        });
    } catch (error) {
        next(error);
    }
};

export const listMissingBrands = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const reports = await BrandRequest.find().sort({createdAt: -1}).limit(100);
        return res.json(reports.map((report) => ({
            id: String(report._id),
            make: report.make,
            model: report.model,
            sellerId: String(report.sellerId),
            createdAt: report.createdAt,
        })));
    } catch (error) {
        next(error);
    }
};
