import {Router} from 'express';
import adRoutes from './adRoutes.js';
import authRoutes from './authRoutes.js';
import brandRoutes from './brandRoutes.js';
import emailRoutes from './emailRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ads', adRoutes);
router.use('/brands', brandRoutes);
router.use('/users', userRoutes);
router.use('/emails', emailRoutes);

export default router;
