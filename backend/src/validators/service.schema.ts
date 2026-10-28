import { z } from 'zod';

export const createServiceSchema = z.object({
  cg_id: z
    .number({ required_error: 'กรุณาระบุหมวดหมู่บริการ (cg_id)' })
    .int('cg_id ต้องเป็นจำนวนเต็ม'),
  name: z
    .string({ required_error: 'กรุณาระบุชื่อบริการ' })
    .min(2, 'ชื่อบริการต้องมีอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อบริการยาวเกิน 100 ตัวอักษร'),
  detail: z
    .string({ required_error: 'กรุณาระบุรายละเอียดบริการ' })
    .min(5, 'รายละเอียดบริการต้องมีอย่างน้อย 5 ตัวอักษร')
    .max(500, 'รายละเอียดบริการยาวเกิน 500 ตัวอักษร'),
  price: z
    .number({ required_error: 'กรุณาระบุราคาบริการ' })
    .int('ราคาต้องเป็นจำนวนเต็ม')
    .min(0, 'ราคาต้องไม่ติดลบ'),
  status: z.boolean().default(true).optional(),
  service_image: z
    .string({ required_error: 'กรุณาระบุรูปภาพบริการ' })
    .max(255, 'URL/Path รูปภาพยาวเกิน 255 ตัวอักษร'),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
