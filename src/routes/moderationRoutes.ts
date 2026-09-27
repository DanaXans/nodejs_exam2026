import {Router} from 'express';
import {listEmails, listModerationAds, moderateAd} from '../controllers/moderationController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {UserRole} from '../types/index.js';
import {authMiddleware, requirePermission, requireRole} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/ads', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.AD_MODERATE), asyncHandler(listModerationAds));
router.patch('/ads/:id', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.AD_MODERATE), asyncHandler(moderateAd));
router.get('/emails', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.AD_MODERATE), asyncHandler(listEmails));

export default router;
