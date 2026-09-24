import {Router} from 'express';
import {listEmails} from '../controllers/emailController.js';
import {authMiddleware, requirePermission} from '../middleware/authMiddleware.js';
import {Permission} from '../permissions.js';

const router = Router();

router.get('/', authMiddleware, requirePermission(Permission.EMAIL_READ), listEmails);

export default router;
