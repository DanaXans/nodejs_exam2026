import {Router} from 'express';
import {createManager, listUsers, setBan} from '../controllers/userController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware, requirePermission} from '../middleware/authMiddleware.js';

const router = Router();

router.post('/managers', authMiddleware, requirePermission(Permission.USER_CREATE_MANAGER), asyncHandler(createManager));
router.get('/', authMiddleware, requirePermission(Permission.USER_LIST), asyncHandler(listUsers));
router.patch('/:id/ban', authMiddleware, requirePermission(Permission.USER_BAN), asyncHandler(setBan));

export default router;
