import {Router} from 'express';
import {createAd, deleteAd, getAdAnalytics, getAds} from '../controllers/adController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAds);
router.post('/', authMiddleware, createAd);
router.delete('/:id', authMiddleware, deleteAd);
router.get('/:id/analytics', authMiddleware, getAdAnalytics);

export default router;
