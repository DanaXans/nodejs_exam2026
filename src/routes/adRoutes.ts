import {Router} from 'express';
import {createAd, deleteAd, getAd, getAdAnalytics, getAds, updateAd} from '../controllers/adController.js';
import {authMiddleware, optionalAuth} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, getAds);
router.get('/:id/analytics', authMiddleware, getAdAnalytics);
router.get('/:id', optionalAuth, getAd);
router.post('/', authMiddleware, createAd);
router.patch('/:id', authMiddleware, updateAd);
router.delete('/:id', authMiddleware, deleteAd);

export default router;
