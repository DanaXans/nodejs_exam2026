import {Router} from 'express';
import {createAd, deleteAd, getAd, getAdAnalytics, getAds, updateAd} from '../controllers/adController.js';
import {authMiddleware, optionalAuth, requirePermission} from '../middleware/authMiddleware.js';
import {Permission} from '../permissions.js';

const router = Router();

router.get('/', optionalAuth, getAds);
router.get('/:id/analytics', authMiddleware, requirePermission(Permission.AD_STATS), getAdAnalytics);
router.get('/:id', optionalAuth, getAd);
router.post('/', authMiddleware, requirePermission(Permission.AD_CREATE), createAd);
router.patch('/:id', authMiddleware, requirePermission(Permission.AD_EDIT_OWN), updateAd);
router.delete('/:id', authMiddleware, deleteAd);

export default router;
