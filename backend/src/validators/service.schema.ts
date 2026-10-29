import { z } from 'zod';

export const createServiceSchema = z.object({
  cg_id: z
    .number({ required_error: 'กรุณาเลือกหมวดหมู่บริการ (หมวดหมู่บริการต้องไม่เว้นว่าง)' })
    .int('หมวดหมู่บริการต้องเป็นจำนวนเต็ม')
    .positive('กรุณาเลือกหมวดหมู่บริการที่ถูกต้อง'),
  name: z
    .string({ required_error: 'กรุณากรอกชื่อบริการ' })
    .min(2, 'ชื่อบริการต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อบริการยาวเกิน 100 ตัวอักษร'),
  detail: z
    .string({ required_error: 'กรุณากรอกรายละเอียดบริการ' })
    .min(5, 'รายละเอียดบริการต้องมีอย่างน้อย 5 ตัวอักษร')
    .max(500, 'รายละเอียดบริการยาวเกิน 500 ตัวอักษร'),
  price: z
    .number({ required_error: 'กรุณากรอกราคาบริการ' })
    .int('ราคาต้องเป็นจำนวนเต็ม (ไม่มีจุดทศนิยม)')
    .min(0, 'ราคาบริการต้องไม่ติดลบ (ต้องเป็น 0 บาทขึ้นไป)'),
  status: z.boolean().default(true).optional(),
  service_image: z
    .string({ required_error: 'กรุณาระบุ URL รูปภาพบริการ' })
    .min(1, 'กรุณาระบุ URL รูปภาพบริการ')
    .max(255, 'URL รูปภาพบริการยาวเกิน 255 ตัวอักษร'),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
