import { Router } from 'express';
import { loginRateLimiter } from '../../middlewares/rateLimit.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { getMe, login, logout } from './auth.controller';
import { loginSchema } from './auth.schema';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;

