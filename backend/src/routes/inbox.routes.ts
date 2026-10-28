import { Router } from 'express';
import {
  createInboxMessage,
  deleteInboxMessage,
  getAllInboxMessages,
  getInboxMessageById,
  updateInboxMessageStatus,
} from '../controllers/inbox.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireStaff } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createInboxMessageSchema, updateInboxStatusSchema } from '../validators/inbox.schema';

const router = Router();

// Public: ลูกค้าส่งฟอร์มแจ้งซ่อมจากหน้าเว็บ
router.post('/', validateBody(createInboxMessageSchema), createInboxMessage);

// Protected: เฉพาะ Admin และ ช่าง
router.get('/', authenticate, requireStaff, getAllInboxMessages);
router.get('/:id', authenticate, requireStaff, getInboxMessageById); // เปิดอ่านจะเปลี่ยน is_read = true อัตโนมัติ
router.patch('/:id/status', authenticate, requireStaff, validateBody(updateInboxStatusSchema), updateInboxMessageStatus);
router.delete('/:id', authenticate, requireStaff, deleteInboxMessage);

export default router;
