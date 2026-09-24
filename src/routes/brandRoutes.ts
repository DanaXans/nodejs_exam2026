import {Router} from 'express';
import {getBrands, listMissingBrands, reportMissingBrand} from '../controllers/brandController.js';
import {authMiddleware, requireRole} from '../middleware/authMiddleware.js';
import {UserRole} from '../types/index.js';

const router = Router();

router.get('/', getBrands);
router.post('/missing', authMiddleware, requireRole(UserRole.SELLER), reportMissingBrand);
router.get('/missing', authMiddleware, requireRole(UserRole.ADMIN), listMissingBrands);

export default router;
