import { z } from 'zod';

export const createInboxMessageSchema = z.object({
  service_id: z
    .number()
    .int('service_id ต้องเป็นจำนวนเต็ม')
    .optional()
    .nullable(),
  cm_username: z
    .string({ required_error: 'กรุณากรอกชื่อของคุณ' })
    .min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อยาวเกิน 100 ตัวอักษร'),
  cm_cel: z
    .string({ required_error: 'กรุณากรอกเบอร์โทรศัพท์' })
    .min(9, 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก')
    .max(15, 'เบอร์โทรยาวเกิน 15 หลัก'),
  cm_email: z
    .string({ required_error: 'กรุณากรอกอีเมล' })
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(100, 'อีเมลยาวเกิน 100 ตัวอักษร'),
  cm_symptom: z
    .string({ required_error: 'กรุณาระบุอาการเสียของสินค้า' })
    .min(5, 'อาการเสียต้องมีอย่างน้อย 5 ตัวอักษร')
    .max(500, 'อาการเสียยาวเกิน 500 ตัวอักษร'),
  cm_image: z.string().max(255, 'รูปภาพยาวเกิน 255 ตัวอักษร').optional().nullable(),
});

export const updateInboxStatusSchema = z.object({
  service_id: z.number().int().optional().nullable(),
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
