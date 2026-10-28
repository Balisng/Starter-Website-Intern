import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// เฉพาะ Admin เท่านั้นที่เข้าดูหน้า Dashboard สรุปยอดได้
router.get('/', authenticate, requireAdmin, getDashboardStats);

export default router;
