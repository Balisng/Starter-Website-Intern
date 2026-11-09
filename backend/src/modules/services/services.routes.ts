import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireAdmin } from '../../middlewares/role.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
} from './services.controller';
import { createServiceSchema, updateServiceSchema } from './services.schema';

const router = Router();

// Public: ดูรายการบริการ
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Admin: จัดการรายการบริการ
router.post('/', authenticate, requireAdmin, validateBody(createServiceSchema), createService);
router.put('/:id', authenticate, requireAdmin, validateBody(updateServiceSchema), updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);

export default router;

