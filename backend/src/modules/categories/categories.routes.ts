import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { createCategory, getAllCategories, getCategoryById } from './categories.controller';
import { createCategorySchema } from './categories.schema';

const router = Router();

// Public: ดูหมวดหมู่ทั้งหมด
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin: เพิ่มหมวดหมู่ (ตรวจสอบข้อมูลด้วย Zod Schema)
router.post('/', authenticate, requireAdmin, validateBody(createCategorySchema), createCategory);

export default router;

