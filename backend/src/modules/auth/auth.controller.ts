import bcrypt from 'bcryptjs';
import { eq, ilike } from 'drizzle-orm';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db';
import { JWT_SECRET } from '../../config/env';
import { users } from '../../db/schema';
import { resetRateLimit } from '../../middlewares/rateLimit.middleware';
import { AuthUserPayload } from '../../types/auth';

const COOKIE_NAME = 'auth_token';

/**
 * POST /api/auth/login
 * เข้าสู่ระบบสำหรับ Admin และช่าง (เก็บบน HttpOnly Cookie)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, pwd } = req.body;
    const cleanUsername = (username || '').trim();

    // ค้นหาผู้ใช้จาก username แบบ Case-insensitive (พิมพ์เล็กหรือพิมพ์ใหญ่ก็พบ)
    const [user] = await db
      .select()
      .from(users)
      .where(ilike(users.username, cleanUsername))
      .limit(1);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Username หรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // ตรวจสอบรหัสผ่านที่เข้ารหัสด้วย bcrypt
    const isPasswordValid = await bcrypt.compare(pwd, user.pwd);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Username หรือรหัสผ่านไม่ถูกต้อง',
      });
      return;
    }

    // เมื่อล็อกอินสำเร็จ ให้รีเซ็ต Rate Limit ของ IP นี้ทันที
    resetRateLimit('auth_login', req);

    // สร้าง JWT Token
    const payload: AuthUserPayload = {
      u_id: user.u_id,
      username: user.username,
      role: user.role,
      u_name: user.u_name,
      u_surname: user.u_surname,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
    });

    const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

    // เซ็ต Cookie แบบ HttpOnly (ปลอดภัยจากการถูกดึงผ่าน XSS / Local Storage)
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
      path: '/',
    });

    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: payload,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
    });
  }
}

/**
 * POST /api/auth/logout
 * ออกจากระบบ และเคลียร์ Cookie
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
  });

  res.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ',
  });
}

/**
 * GET /api/auth/me
 * ดึงข้อมูลผู้ใช้งานปัจจุบันจาก Cookie Session
 * ส่งกลับ 200 พร้อม user: null เสมอหากยังไม่ได้เข้าสู่ระบบ เพื่อไม่ให้เกิด Error 401 ใน Console
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      res.status(200).json({
        success: true,
        user: null,
      });
      return;
    }

    let decoded: AuthUserPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    } catch {
      const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
      });
      res.status(200).json({
        success: true,
        user: null,
      });
      return;
    }

    // ตรวจสอบข้อมูลผู้ใช้และ Role ล่าสุดจากฐานข้อมูลจริง
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
      const isSecure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
      });
      res.status(200).json({
        success: true,
        user: null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(200).json({
      success: true,
      user: null,
    });
  }
}

