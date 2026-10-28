# Middlewares
โฟลเดอร์สำหรับ Middleware:
- `auth.middleware.ts`: ตรวจสอบ Token จาก Cookie (HttpOnly) เพื่อยืนยันตัวตน
- `role.middleware.ts`: ตรวจสอบ Role (Admin เข้าได้ทุกหน้า, Technician เข้าได้เฉพาะ Inbox)
- `validate.middleware.ts`: Middleware ตรวจสอบ Request Body ด้วย Zod Schema
- `error.middleware.ts`: Global Error Handler ป้องกันไม่ให้แอป Crash
