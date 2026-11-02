import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { JWT_SECRET } from '../config/env';
import { users } from '../db/schema';
import { AuthUserPayload } from '../types/auth';

/**
 * Middleware สำหรับตรวจสอบสิทธิ์ผู้ใช้งานผ่าน HttpOnly Cookie ('auth_token')
 * พร้อมตรวจสอบสถานะผู้ใช้และ Role ล่าสุดจากฐานข้อมูลจริงทุกครั้ง
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    // ตรวจสอบข้อมูลผู้ใช้และ Role ล่าสุดจากฐานข้อมูล (ป้องกันกรณีผู้ใช้ถูกลบหรือเปลี่ยน Role ระหว่างที่ Token ยังไม่หมดอายุ)
    const [currentUser] = await db
      .select({
        u_id: users.u_id,
        username: users.username,
        role: users.role,
        u_name: users.u_name,
        u_surname: users.u_surname,
        email: users.email,
      })
      .from(users)
      .where(eq(users.u_id, decoded.u_id))
      .limit(1);

    if (!currentUser) {
      res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.status(401).json({
        success: false,
        message: 'ไม่พบบัญชีผู้ใช้งานในระบบ หรือบัญชีถูกยกเลิกแล้ว กรุณาเข้าสู่ระบบใหม่',
      });
      return;
    }

    req.user = currentUser;
    next();
  } catch (_error) {
    res.status(401).json({
      success: false,
      message: 'Token หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
    });
  }
}
