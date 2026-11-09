import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

const FIELD_LABELS: Record<string, string> = {
  username: 'ชื่อผู้ใช้งาน (Username)',
  pwd: 'รหัสผ่าน (Password)',
  u_name: 'ชื่อจริง',
  u_surname: 'นามสกุล',
  role: 'สิทธิ์การใช้งาน (Role)',
  cel: 'เบอร์โทรศัพท์',
  email: 'อีเมล',
  cg_id: 'หมวดหมู่บริการ',
  cg_name: 'ชื่อหมวดหมู่บริการ',
  name: 'ชื่อบริการ',
  detail: 'รายละเอียดบริการ',
  price: 'ราคาบริการ',
  status: 'สถานะบริการ',
  service_image: 'ลิงก์รูปภาพบริการ',
  service_id: 'บริการที่เลือก',
  technician_id: 'ช่างผู้รับผิดชอบ',
  cm_username: 'ชื่อผู้ติดต่อ',
  cm_cel: 'เบอร์โทรศัพท์ผู้ติดต่อ',
  cm_email: 'อีเมลติดต่อกลับ',
  cm_symptom: 'รายละเอียดอาการเสีย',
  cm_image: 'ลิงก์รูปภาพอาการเสีย',
  promo_code: 'โค้ดส่วนลดโปรโมชั่น',
  repair_status: 'สถานะการซ่อม',
  comment: 'บันทึกการซ่อม / ความคิดเห็นช่าง',
};

/**
 * Middleware สำหรับ Validate request body ด้วย Zod Schema
 * พร้อมระบุชื่อช่องที่กรอกผิดและสาเหตุอย่างชัดเจนเป็นภาษาไทย
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => {
          const fieldKey = err.path.join('.');
          const label = FIELD_LABELS[fieldKey] || fieldKey || 'ข้อมูลที่กรอก';
          return {
            field: fieldKey,
            label,
            message: err.message,
            fullMessage: `[${label}] ${err.message}`,
          };
        });

        const detailedMessages = formattedErrors
          .map((err) => err.fullMessage)
          .filter(Boolean);

        const summaryMessage =
          detailedMessages.length > 0
            ? `กรุณาตรวจสอบข้อมูล: ${detailedMessages.join(' | ')}`
            : 'ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบช่องที่กรอกอีกครั้ง';

        res.status(400).json({
          success: false,
          message: summaryMessage,
          errors: formattedErrors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการตรวจสอบรูปแบบข้อมูล',
      });
    }
  };
}
