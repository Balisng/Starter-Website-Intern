import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string({ required_error: 'กรุณากรอก Username' })
    .min(1, 'Username ต้องไม่ว่างเปล่า')
    .max(50, 'Username ยาวเกิน 50 ตัวอักษร'),
  pwd: z
    .string({ required_error: 'กรุณากรอกรหัสผ่าน' })
    .min(1, 'กรุณาระบุรหัสผ่าน'),
});

export type LoginInput = z.infer<typeof loginSchema>;
