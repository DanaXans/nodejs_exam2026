import {Router} from 'express';
import {
    contactSeller,
    createAd,
    deleteAd,
    getAd,
    getAdAnalytics,
    getAds,
    getMyAds,
    updateAd,
} from '../controllers/adController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware, optionalAuth, requirePermission} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuth, asyncHandler(getAds));
router.get('/mine', authMiddleware, requirePermission(Permission.AD_CREATE), asyncHandler(getMyAds));
router.post('/', authMiddleware, requirePermission(Permission.AD_CREATE), asyncHandler(createAd));
router.get('/:id/analytics', authMiddleware, asyncHandler(getAdAnalytics));
router.post('/:id/contact', authMiddleware, requirePermission(Permission.CONTACT_SELLER), asyncHandler(contactSeller));
router.get('/:id', optionalAuth, asyncHandler(getAd));
router.patch('/:id', authMiddleware, asyncHandler(updateAd));
router.delete('/:id', authMiddleware, asyncHandler(deleteAd));

export default router;
