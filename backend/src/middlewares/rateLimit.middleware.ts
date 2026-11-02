import { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix?: string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

/**
 * สร้าง Middleware สำหรับจำกัดจำนวนครั้งในการยิง API (Rate Limiter) ตาม IP Address
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message, keyPrefix = 'global' } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();

    // ล้างข้อมูลที่หมดอายุแล้วในหน่วยความจำเมื่อมีขนาดใหญ่ขึ้น
    if (store.size > 1000) {
      for (const [k, v] of store.entries()) {
        if (now > v.resetTime) {
          store.delete(k);
        }
      }
    }

    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip) || 'unknown';
    const key = `${keyPrefix}:${clientIp}`;

    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('RateLimit-Limit', maxRequests);
      res.setHeader('RateLimit-Remaining', maxRequests - 1);
      next();
      return;
    }

    record.count += 1;
    const remaining = Math.max(0, maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', retryAfterSeconds);

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        message,
      });
      return;
    }

    next();
  };
}

/**
 * จำกัดการล็อกอินไม่เกิน 10 ครั้ง ต่อ 15 นาที ต่อ IP (ป้องกันการสุ่มรหัสผ่าน Brute-force)
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 นาที
  maxRequests: 10,
  keyPrefix: 'auth_login',
  message: 'คุณพยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่อีกครั้ง',
});

/**
 * จำกัดการส่งฟอร์มแจ้งซ่อมไม่เกิน 10 ครั้ง ต่อ 15 นาที ต่อ IP (ป้องกันการยิงสแปม)
 */
export const inboxSubmitRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 นาที
  maxRequests: 10,
  keyPrefix: 'inbox_submit',
  message: 'คุณส่งแบบฟอร์มแจ้งซ่อมบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
});

