import { NextFunction, Request, Response } from 'express';

/**
 * Middleware อนุญาตเฉพาะผู้ใช้งานที่มี Role เป็น 'admin'
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin เท่านั้น)',
    });
    return;
  }

  next();
}

/**
 * Middleware อนุญาตทั้ง 'admin' และ 'technician' (ช่าง)
 * เช่น ใช้สำหรับเข้าถึงหน้าระบบแจ้งซ่อม Inbox
 */
export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'technician') {
    res.status(403).json({
      success: false,
      message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลส่วนนี้',
    });
    return;
  }

  next();
}
