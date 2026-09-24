import {Router} from 'express';
import {createManager, listUsers, setBan} from '../controllers/userController.js';
import {authMiddleware, requireRole} from '../middleware/authMiddleware.js';
import {UserRole} from '../types/index.js';

const router = Router();

router.get('/', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), listUsers);
router.post('/managers', authMiddleware, requireRole(UserRole.ADMIN), createManager);
router.patch('/:id/ban', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), setBan);

export default router;
