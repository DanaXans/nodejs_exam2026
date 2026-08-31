import {Router} from 'express';
import {createAd, deleteAd, getAds} from '../controllers/adController.js';
import {authMiddleware, requireRole} from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', getAds);
router.post('/', authMiddleware, requireRole(['SELLER', 'MANAGER', 'ADMIN']), createAd);
router.delete('/:id', authMiddleware, deleteAd);

export default router;