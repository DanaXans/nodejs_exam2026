import {Router} from 'express';
import adRoutes from './adRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ads', adRoutes);

router.get('/health', (req, res) => {
    res.json({status: 'ok', timestamp: new Date().toISOString()});
});

export default router;