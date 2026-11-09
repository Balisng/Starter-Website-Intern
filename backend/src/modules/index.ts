import { Router } from 'express';
import authRoutes from './auth/auth.routes';
import categoriesRoutes from './categories/categories.routes';
import dashboardRoutes from './dashboard/dashboard.routes';
import inboxRoutes from './inbox/inbox.routes';
import servicesRoutes from './services/services.routes';
import usersRoutes from './users/users.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/services', servicesRoutes);
router.use('/inbox', inboxRoutes);
router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;

