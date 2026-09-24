import {Router} from 'express';
import {login, register, upgradeToPremium,} from '../controllers/authController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/upgrade-to-premium', authMiddleware, upgradeToPremium);

export default router;
