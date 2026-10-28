import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.schema';

const router = Router();

// เฉพาะ Admin เท่านั้นที่มีสิทธิ์เข้าถึงโมดูล User Management
router.use(authenticate, requireAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', validateBody(createUserSchema), createUser);
router.put('/:id', validateBody(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
