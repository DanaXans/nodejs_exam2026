import {Router} from 'express';
import {
    createCatalogRequest,
    getMakes,
    getModels,
    getRates,
    getRegions,
    listCatalogRequests,
    reviewCatalogRequest,
} from '../controllers/catalogController.js';
import {Permission} from '../constants/permissions.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {UserRole} from '../types/index.js';
import {authMiddleware, requirePermission, requireRole} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/makes', asyncHandler(getMakes));
router.get('/makes/:make/models', asyncHandler(getModels));
router.get('/regions', asyncHandler(getRegions));
router.get('/rates', asyncHandler(getRates));
router.post('/requests', authMiddleware, requirePermission(Permission.CATALOG_REQUEST), asyncHandler(createCatalogRequest));
router.get('/requests', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.CATALOG_MANAGE), asyncHandler(listCatalogRequests));
router.patch('/requests/:id', authMiddleware, requireRole(UserRole.MANAGER, UserRole.ADMIN), requirePermission(Permission.CATALOG_MANAGE), asyncHandler(reviewCatalogRequest));

export default router;
