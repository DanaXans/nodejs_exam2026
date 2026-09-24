import {Router} from 'express';
import {getBrands, listMissingBrands, reportMissingBrand} from '../controllers/brandController.js';
import {authMiddleware, requirePermission} from '../middleware/authMiddleware.js';
import {Permission} from '../permissions.js';

const router = Router();

router.get('/', getBrands);
router.post('/missing', authMiddleware, requirePermission(Permission.BRAND_REPORT), reportMissingBrand);
router.get('/missing', authMiddleware, requirePermission(Permission.BRAND_REVIEW), listMissingBrands);

export default router;
