import { Router } from 'express';
import authRoutes from './auth.routes';
import categoriesRoutes from './categories.routes';
import dashboardRoutes from './dashboard.routes';
import inboxRoutes from './inbox.routes';
import servicesRoutes from './services.routes';
import usersRoutes from './users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/services', servicesRoutes);
router.use('/inbox', inboxRoutes);
router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
