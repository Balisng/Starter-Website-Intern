import { NextFunction, Request, Response } from 'express';

export interface AppError extends Error {
  status?: number;
  code?: string;
  detail?: string;
  constraint?: string;
  column?: string;
}

/**
 * แปลงข้อผิดพลาดจากฐานข้อมูลหรือระบบ ให้เป็นข้อความภาษาไทยที่ระบุสาเหตุชัดเจนว่าผิดตรงจุดไหน
 */
export function resolveControllerError(
  error: unknown,
  fallbackContext: string
): { status: number; message: string } {
  if (!error || typeof error !== 'object') {
    return { status: 500, message: `${fallbackContext}: เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ` };
  }

  const err = error as AppError;
  const code = err.code || '';
  const rawMessage = err.message || '';

  // 1. Unique Constraint Violation (ข้อมูลซ้ำ เช่น username ซ้ำ)
  if (code === '23505') {
    if (err.constraint?.includes('username') || rawMessage.includes('username')) {
      return {
        status: 400,
        message: 'ข้อมูลซ้ำ: [ชื่อผู้ใช้งาน (Username)] นี้ถูกใช้งานในระบบแล้ว กรุณาตั้งชื่ออื่น',
      };
    }
    return {
      status: 400,
      message: `${fallbackContext}: ข้อมูลที่ระบุซ้ำกับข้อมูลที่มีอยู่แล้วในระบบ`,
    };
  }

  // 2. Foreign Key Violation (อ้างอิงข้อมูลที่ไม่มีอยู่ หรือติดเงื่อนไขห้ามลบ)
  if (code === '23503') {
    if (rawMessage.includes('services_cg_id') || err.constraint?.includes('services_cg_id')) {
      return {
        status: 400,
        message:
          'ไม่สามารถดำเนินการได้: [หมวดหมู่บริการ] ที่ระบุไม่มีอยู่ในระบบ หรือยังมีบริการผูกอยู่กับหมวดหมู่นี้',
      };
    }
    if (rawMessage.includes('service_id') || err.constraint?.includes('service_id')) {
      return {
        status: 400,
        message: 'ข้อมูลไม่ถูกต้อง: [บริการที่เลือก] ไม่มีอยู่ในระบบ กรุณาเลือกบริการใหม่อีกครั้ง',
      };
    }
    if (rawMessage.includes('technician_id') || err.constraint?.includes('technician_id')) {
      return {
        status: 400,
        message: 'ข้อมูลไม่ถูกต้อง: [ช่างผู้รับผิดชอบ] ที่เลือกไม่มีอยู่ในระบบ',
      };
    }
    return {
      status: 400,
      message: `${fallbackContext}: ข้อมูลอ้างอิงไม่ถูกต้อง หรือข้อมูลนี้ยังถูกใช้งานอยู่ในส่วนอื่น`,
    };
  }

  // 3. String Data Right Truncation (ข้อความยาวเกินขนาดคอลัมน์ในฐานข้อมูล)
  if (code === '22001') {
    return {
      status: 400,
      message: `${fallbackContext}: ข้อความหรือลิงก์รูปภาพที่คุณกรอกมีความยาวเกินกำหนด (ลิงก์รูปภาพต้องไม่เกิน 255 ตัวอักษร และรายละเอียดต้องไม่เกิน 500 ตัวอักษร)`,
    };
  }

  // 4. Invalid Text Representation / Numeric Out of Range
  if (code === '22P02' || code === '22003') {
    return {
      status: 400,
      message: `${fallbackContext}: รูปแบบตัวเลขหรือสถานะที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบค่าที่กรอกอีกครั้ง`,
    };
  }

  // 5. Missing Column / Schema Mismatch
  if (code === '42703') {
    return {
      status: 500,
      message: `${fallbackContext}: โครงสร้างตารางฐานข้อมูลยังไม่อัปเดต (${rawMessage}) กรุณารันคำสั่ง bun run db:push`,
    };
  }

  // 6. Database Connection / Timeout Errors
  if (
    rawMessage.includes('ECONNREFUSED') ||
    rawMessage.includes('CONNECT_TIMEOUT') ||
    rawMessage.includes('ENOTFOUND') ||
    rawMessage.includes('password authentication failed') ||
    rawMessage.includes('channel_binding')
  ) {
    return {
      status: 503,
      message: `${fallbackContext}: ไม่สามารถเชื่อมต่อฐานข้อมูลได้ กรุณาตรวจสอบค่า DATABASE_URL ในไฟล์ .env`,
    };
  }

  return {
    status: err.status || 500,
    message: rawMessage ? `${fallbackContext} (${rawMessage})` : fallbackContext,
  };
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('💥 Uncaught Server Error:', err);

  const resolved = resolveControllerError(err, 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์');

  res.status(resolved.status).json({
    success: false,
    message: resolved.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
