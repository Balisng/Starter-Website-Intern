import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUserPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'repair_service_secret_key_2026_change_in_production';

/**
 * Middleware สำหรับตรวจสอบสิทธิ์ผู้ใช้งานผ่าน HttpOnly Cookie ('auth_token')
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ (Unauthorized: Cookie token missing)',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
    });
  }
}
