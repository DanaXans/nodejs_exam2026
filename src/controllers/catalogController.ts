import {Response} from 'express';
import {REGIONS} from '../constants/regions.js';
import {HttpError} from '../errors/HttpError.js';
import {AuthRequest} from '../middleware/authMiddleware.js';
import {CarMake} from '../models/CarMake.js';
import {CatalogRequest} from '../models/CatalogRequest.js';
import {getTodayRate} from '../services/currencyService.js';
import {CatalogRequestStatus, CatalogRequestType} from '../types/index.js';
import {escapeRegex} from '../utils/money.js';

export const getMakes = async (_req: AuthRequest, res: Response) => {
    const makes = await CarMake.find().sort({name: 1});
    res.json(makes.map((make) => ({
        id: String(make._id),
        name: make.name,
        models: make.models.map((model) => model.name),
    })));
};

export const getModels = async (req: AuthRequest, res: Response) => {
    const makeName = String(req.params.make ?? '');
    const make = await CarMake.findOne({name: new RegExp(`^${escapeRegex(makeName)}$`, 'i')});
    if (!make) {
        throw new HttpError(404, 'Марку не знайдено');
    }
    res.json({
        make: make.name,
        models: make.models.map((model) => model.name),
    });
};

export const getRegions = async (_req: AuthRequest, res: Response) => {
    res.json(REGIONS);
};

export const getRates = async (_req: AuthRequest, res: Response) => {
    const rate = await getTodayRate();
    res.json({
        ...rate,
        note: 'Курс ПриватБанку замокано і фіксується один раз на календарний день (Europe/Kyiv).',
    });
};

export const createCatalogRequest = async (req: AuthRequest, res: Response) => {
    const type = String(req.body?.type ?? '').toUpperCase();
    const requestedName = String(req.body?.name ?? '').trim();
    const makeName = String(req.body?.make ?? '').trim();

    if (type !== CatalogRequestType.MAKE && type !== CatalogRequestType.MODEL) {
        throw new HttpError(400, 'type має бути MAKE або MODEL');
    }
    if (!requestedName) {
        throw new HttpError(400, 'Вкажіть назву, якої не вистачає');
    }
    if (type === CatalogRequestType.MODEL && !makeName) {
        throw new HttpError(400, 'Для моделі вкажіть марку в полі make');
    }

    if (type === CatalogRequestType.MAKE) {
        const exists = await CarMake.findOne({name: new RegExp(`^${escapeRegex(requestedName)}$`, 'i')});
        if (exists) {
            throw new HttpError(409, 'Така марка вже є в каталозі');
        }
    } else {
        const make = await CarMake.findOne({name: new RegExp(`^${escapeRegex(makeName)}$`, 'i')});
        if (!make) {
            throw new HttpError(400, 'Спочатку має зʼявитися марка. Якщо її немає, надішліть запит type=MAKE');
        }
        const modelExists = make.models.some((model) => model.name.toLowerCase() === requestedName.toLowerCase());
        if (modelExists) {
            throw new HttpError(409, 'Така модель вже є в каталозі');
        }
    }

    const pending = await CatalogRequest.findOne({
        type,
        requestedName: new RegExp(`^${escapeRegex(requestedName)}$`, 'i'),
        status: CatalogRequestStatus.PENDING,
        ...(type === CatalogRequestType.MODEL ? {makeName} : {}),
    });
    if (pending) {
        throw new HttpError(409, 'Такий запит вже очікує на розгляд');
    }

    const created = await CatalogRequest.create({
        authorId: req.auth?.id,
        type,
        requestedName,
        ...(type === CatalogRequestType.MODEL ? {makeName} : {}),
    });

    res.status(201).json({
        message: 'Запит надіслано адміністрації',
        request: created,
    });
};

export const listCatalogRequests = async (req: AuthRequest, res: Response) => {
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;
    const filter = status ? {status} : {};
    const requests = await CatalogRequest.find(filter).sort({createdAt: -1});
    res.json(requests);
};

export const reviewCatalogRequest = async (req: AuthRequest, res: Response) => {
    const action = String(req.body?.action ?? '').toUpperCase();
    const request = await CatalogRequest.findById(req.params.id);
    if (!request) {
        throw new HttpError(404, 'Запит не знайдено');
    }
    if (request.status !== CatalogRequestStatus.PENDING) {
        throw new HttpError(400, 'Цей запит вже розглянуто');
    }
    if (action !== 'APPROVE' && action !== 'REJECT') {
        throw new HttpError(400, 'action має бути APPROVE або REJECT');
    }

    if (action === 'REJECT') {
        request.status = CatalogRequestStatus.REJECTED;
        await request.save();
        res.json({message: 'Запит відхилено', request});
        return;
    }

    if (request.type === CatalogRequestType.MAKE) {
        const exists = await CarMake.findOne({name: new RegExp(`^${escapeRegex(request.requestedName)}$`, 'i')});
        if (!exists) {
            await CarMake.create({name: request.requestedName, models: []});
        }
    } else {
        const make = await CarMake.findOne({name: new RegExp(`^${escapeRegex(request.makeName ?? '')}$`, 'i')});
        if (!make) {
            throw new HttpError(400, 'Марку для цієї моделі не знайдено. Спочатку додайте марку.');
        }
        const already = make.models.some((model) => model.name.toLowerCase() === request.requestedName.toLowerCase());
        if (!already) {
            make.models.push({name: request.requestedName});
            await make.save();
        }
    }

    request.status = CatalogRequestStatus.APPROVED;
    await request.save();
    res.json({message: 'Запит схвалено і каталог оновлено', request});
};
