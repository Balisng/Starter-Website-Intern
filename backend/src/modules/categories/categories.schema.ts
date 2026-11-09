import { z } from 'zod';

export const createCategorySchema = z.object({
  cg_name: z
    .string({ required_error: 'กรุณาระบุชื่อหมวดหมู่' })
    .trim()
    .min(1, 'กรุณาระบุชื่อหมวดหมู่')
    .max(50, 'ชื่อหมวดหมู่ยาวเกิน 50 ตัวอักษร'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

