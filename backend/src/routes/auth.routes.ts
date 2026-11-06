import { Router } from 'express';
import { getMe, login, logout } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.schema';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;
