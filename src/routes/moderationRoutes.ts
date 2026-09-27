import {Router} from 'express';
import {listEmails, listModerationAds, moderateAd} from '../controllers/moderationController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware, requirePermission} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/ads', authMiddleware, requirePermission(Permission.AD_MODERATE), asyncHandler(listModerationAds));
router.patch('/ads/:id', authMiddleware, requirePermission(Permission.AD_MODERATE), asyncHandler(moderateAd));
router.get('/emails', authMiddleware, requirePermission(Permission.AD_MODERATE), asyncHandler(listEmails));

export default router;
