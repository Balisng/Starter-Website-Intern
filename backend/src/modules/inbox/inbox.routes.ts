import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { inboxSubmitRateLimiter } from '../../middlewares/rateLimit.middleware';
import { requireAdmin, requireStaff } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import {
  createInboxMessage,
  deleteInboxMessage,
  getAllInboxMessages,
  getInboxMessageById,
  markInboxMessageAsRead,
  updateInboxMessageStatus,
} from './inbox.controller';
import { createInboxMessageSchema, updateInboxStatusSchema } from './inbox.schema';

const router = Router();

// Public: ลูกค้าส่งฟอร์มแจ้งซ่อมจากหน้าเว็บ (มี Rate Limit ป้องกันสแปม)
router.post('/', inboxSubmitRateLimiter, validateBody(createInboxMessageSchema), createInboxMessage);

// Protected: เฉพาะ Admin และ ช่าง (ดูรายการ, ดูรายละเอียด, เปลี่ยนสถานะอ่านแล้ว, อัปเดตสถานะงานซ่อม)
router.get('/', authenticate, requireStaff, getAllInboxMessages);
router.get('/:id', authenticate, requireStaff, getInboxMessageById);
router.patch('/:id/read', authenticate, requireStaff, markInboxMessageAsRead);
router.patch(
  '/:id/status',
  authenticate,
  requireStaff,
  validateBody(updateInboxStatusSchema),
  updateInboxMessageStatus
);

// Protected: ลบรายการแจ้งซ่อมได้เฉพาะ Admin เท่านั้น
router.delete('/:id', authenticate, requireAdmin, deleteInboxMessage);

export default router;

