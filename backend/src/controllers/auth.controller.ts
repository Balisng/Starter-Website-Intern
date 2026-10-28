import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { users } from '../db/schema';
import { AuthUserPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'repair_service_secret_key_2026_change_in_production';
const COOKIE_NAME = 'auth_token';

/**
 * POST /api/auth/login
 * เข้าสู่ระบบสำหรับ Admin และช่าง (เก็บบน HttpOnly Cookie)
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, pwd } = req.body;

    // ค้นหาผู้ใช้จาก username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
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

    // เซ็ต Cookie แบบ HttpOnly (ปลอดภัยจากการถูกดึงผ่าน XSS / Local Storage)
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'ยังไม่ได้เข้าสู่ระบบ',
    });
    return;
  }

  res.json({
    success: true,
    user: req.user,
  });
}
