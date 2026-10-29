import { z } from 'zod';

import { PHONE_REGEX, EMAIL_REGEX } from './inbox.schema';

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
    .regex(PHONE_REGEX, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (06x, 08x, 09x ครบ 10 หลัก)'),
  email: z
    .string({ required_error: 'กรุณาระบุอีเมล' })
    .max(100, 'อีเมลยาวเกิน 100 ตัวอักษร')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .regex(
      EMAIL_REGEX,
      'รูปแบบอีเมลไม่ถูกต้อง (อนุญาตเฉพาะ @gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com หรือโดเมนมาตรฐาน .com, .co.th, .ac.th)'
    ),
});

export const updateUserSchema = z.object({
  pwd: z.string().min(4, 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร').optional(),
  u_name: z.string().min(1, 'กรุณาระบุชื่อจริง').max(50, 'ชื่อจริงยาวเกิน 50 ตัวอักษร').optional(),
  u_surname: z.string().min(1, 'กรุณาระบุนามสกุล').max(50, 'นามสกุลยาวเกิน 50 ตัวอักษร').optional(),
  role: z.enum(['admin', 'technician'], {
    errorMap: () => ({ message: "Role ต้องเป็น 'admin' หรือ 'technician'" }),
  }).optional(),
  cel: z
    .string()
    .regex(PHONE_REGEX, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (06x, 08x, 09x ครบ 10 หลัก)')
    .optional(),
  email: z
    .string()
    .max(100, 'อีเมลยาวเกิน 100 ตัวอักษร')
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .regex(
      EMAIL_REGEX,
      'รูปแบบอีเมลไม่ถูกต้อง (อนุญาตเฉพาะ @gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com หรือโดเมนมาตรฐาน .com, .co.th, .ac.th)'
    )
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
