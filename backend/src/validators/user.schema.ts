import { z } from 'zod';

export const createUserSchema = z.object({
  username: z
    .string({ required_error: 'กรุณาระบุ Username' })
    .min(3, 'Username ต้องมีอย่างน้อย 3 ตัวอักษร')
    .max(50, 'Username ยาวเกิน 50 ตัวอักษร'),
  pwd: z
    .string({ required_error: 'กรุณาระบุรหัสผ่าน' })
    .min(4, 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร')
    .max(255, 'รหัสผ่านยาวเกินกำหนด'),
  u_name: z
    .string({ required_error: 'กรุณาระบุชื่อจริง' })
    .min(1, 'กรุณาระบุชื่อจริง')
    .max(50, 'ชื่อจริงยาวเกิน 50 ตัวอักษร'),
  u_surname: z
    .string({ required_error: 'กรุณาระบุนามสกุล' })
    .min(1, 'กรุณาระบุนามสกุล')
    .max(50, 'นามสกุลยาวเกิน 50 ตัวอักษร'),
  role: z.enum(['admin', 'technician'], {
    errorMap: () => ({ message: "Role ต้องเป็น 'admin' หรือ 'technician'" }),
  }),
  cel: z
    .string({ required_error: 'กรุณาระบุเบอร์โทรศัพท์' })
    .min(9, 'เบอร์โทรต้องมีอย่างน้อย 9 หลัก')
    .max(15, 'เบอร์โทรยาวเกิน 15 หลัก'),
  email: z
    .string({ required_error: 'กรุณาระบุอีเมล' })
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .max(100, 'อีเมลยาวเกิน 100 ตัวอักษร'),
});

export const updateUserSchema = z.object({
  pwd: z.string().min(4, 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร').optional(),
  u_name: z.string().min(1).max(50).optional(),
  u_surname: z.string().min(1).max(50).optional(),
  role: z.enum(['admin', 'technician']).optional(),
  cel: z.string().min(9).max(15).optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
