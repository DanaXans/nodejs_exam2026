import {Router} from 'express';
import {listContacts} from '../controllers/adController.js';
import {asyncHandler} from '../middleware/asyncHandler.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, asyncHandler(listContacts));

export default router;
