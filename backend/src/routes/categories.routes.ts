import { Router } from 'express';
import { createCategory, getAllCategories, getCategoryById } from '../controllers/categories.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = Router();

// Public: ดูหมวดหมู่ทั้งหมด
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin: เพิ่มหมวดหมู่
router.post('/', authenticate, requireAdmin, createCategory);

export default router;
