import {Router} from 'express';
import {login, me, register, upgradeToPremium} from '../controllers/authController.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authMiddleware, asyncHandler(me));
router.post('/upgrade-to-premium', authMiddleware, asyncHandler(upgradeToPremium));

export default router;
