import { Router } from 'express';
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
} from '../controllers/services.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createServiceSchema, updateServiceSchema } from '../validators/service.schema';

const router = Router();

// Public: ดูรายการบริการ
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin: จัดการรายการบริการ
router.post('/', authenticate, requireAdmin, validateBody(createServiceSchema), createService);
router.put('/:id', authenticate, requireAdmin, validateBody(updateServiceSchema), updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);

export default router;
