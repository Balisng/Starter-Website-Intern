import { z } from 'zod';

// Regex สำหรับตรวจสอบเบอร์โทรศัพท์ (06x, 08x, 09x ครบ 10 หลัก)
export const PHONE_REGEX = /^(0[689]\d{8}|0[689]\d-\d{3}-\d{4})$/;

// Regex สำหรับตรวจสอบอีเมลมาตรฐานและผู้ให้บริการชั้นนำ
export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|[a-zA-Z0-9-]+\.(com|co\.th|ac\.th|or\.th|go\.th))$/i;

export const createInboxMessageSchema = z.object({
  service_id: z
    .number()
    .int('service_id ต้องเป็นจำนวนเต็ม')
    .optional()
    .nullable(),
  cm_username: z
    .string({ required_error: 'กรุณากรอกชื่อของคุณ' })
    .min(2, 'ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อยาวเกิน 100 ตัวอักษร'),
  cm_cel: z
    .string({ required_error: 'กรุณากรอกเบอร์โทรศัพท์' })
    .regex(PHONE_REGEX, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (06x, 08x, 09x ครบ 10 หลัก)'),
  cm_email: z
    .string({ required_error: 'กรุณากรอกอีเมล' })
    .max(100, 'อีเมลยาวเกิน 100 ตัวอักษร')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .regex(
      EMAIL_REGEX,
      'รูปแบบอีเมลไม่ถูกต้อง (อนุญาตเฉพาะ @gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com หรือโดเมนมาตรฐาน .com, .co.th, .ac.th)'
    ),
  cm_symptom: z
    .string({ required_error: 'กรุณาระบุอาการเสียของสินค้า' })
    .min(5, 'อาการเสียต้องระบุอย่างน้อย 5 ตัวอักษร')
    .max(500, 'อาการเสียยาวเกิน 500 ตัวอักษร'),
  cm_image: z.string().max(255, 'รูปภาพยาวเกิน 255 ตัวอักษร').optional().nullable(),
});

export const updateInboxStatusSchema = z.object({
  service_id: z.number().int().optional().nullable(),
  technician_id: z.number().int('รหัสช่างต้องเป็นจำนวนเต็ม').optional().nullable(),
  repair_status: z
    .enum(['pending', 'completed'], {
      errorMap: () => ({ message: "สถานะการซ่อมต้องเป็น 'pending' หรือ 'completed'" }),
    })
    .optional(),
  comment: z.string().max(500, 'ความคิดเห็นยาวเกิน 500 ตัวอักษร').optional().nullable(),
  is_read: z.boolean().optional(),
});

export type CreateInboxMessageInput = z.infer<typeof createInboxMessageSchema>;
export type UpdateInboxStatusInput = z.infer<typeof updateInboxStatusSchema>;
