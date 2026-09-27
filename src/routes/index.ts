import {Router} from 'express';
import adRoutes from './adRoutes.js';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import contactRoutes from './contactRoutes.js';
import dealershipRoutes from './dealershipRoutes.js';
import moderationRoutes from './moderationRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
    res.json({status: 'ok', timestamp: new Date().toISOString()});
});
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/catalog', catalogRoutes);
router.use('/ads', adRoutes);
router.use('/contacts', contactRoutes);
router.use('/moderation', moderationRoutes);
router.use('/dealerships', dealershipRoutes);

export default router;
