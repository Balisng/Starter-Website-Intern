import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin, requireStaff } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.schema';

const router = Router();

// สิทธิ์การเข้าถึงโมดูล User
// อ่านรายชื่อผู้ใช้/ช่าง: อนุญาต Staff (Admin & Technician) เพื่อใช้ในตัวกรองและมอบหมายงาน
router.get('/', authenticate, requireStaff, getAllUsers);

// การสร้าง แก้ไข ลบ หรือดูเจาะจง: เฉพาะ Admin เท่านั้น
router.get('/:id', authenticate, requireAdmin, getUserById);
router.post('/', authenticate, requireAdmin, validateBody(createUserSchema), createUser);
router.put('/:id', authenticate, requireAdmin, validateBody(updateUserSchema), updateUser);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

export default router;
