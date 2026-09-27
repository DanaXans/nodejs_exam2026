import {Router} from 'express';
import {assignStaff, createDealership, listDealerships} from '../controllers/dealershipController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware, requirePermission} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', asyncHandler(listDealerships));
router.post('/', authMiddleware, requirePermission(Permission.DEALERSHIP_MANAGE), asyncHandler(createDealership));
router.post('/:id/staff', authMiddleware, asyncHandler(assignStaff));

export default router;
