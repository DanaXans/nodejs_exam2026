import {Router} from 'express';
import {createManager, listUsers, setBan} from '../controllers/userController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware, requirePermission, requireRole} from '../middleware/authMiddleware.js';
import {UserRole} from '../types/index.js';

const router = Router();

router.post('/managers', authMiddleware, requireRole(UserRole.ADMIN), requirePermission(Permission.USER_CREATE_MANAGER), asyncHandler(createManager));
router.get('/', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.USER_LIST), asyncHandler(listUsers));
router.patch('/:id/ban', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.USER_BAN), asyncHandler(setBan));

export default router;
