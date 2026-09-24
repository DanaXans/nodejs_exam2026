import {Router} from 'express';
import {createManager, listUsers, setBan} from '../controllers/userController.js';
import {authMiddleware, requirePermission} from '../middleware/authMiddleware.js';
import {Permission} from '../permissions.js';

const router = Router();

router.get('/', authMiddleware, requirePermission(Permission.USER_LIST), listUsers);
router.post('/managers', authMiddleware, requirePermission(Permission.USER_CREATE_MANAGER), createManager);
router.patch('/:id/ban', authMiddleware, requirePermission(Permission.USER_BAN), setBan);

export default router;
