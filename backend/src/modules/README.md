# 📦 Backend Feature Modules (`src/modules/`)

โครงสร้างฝั่ง Backend จัดระเบียบแบบ **Modular Architecture (Feature-based Modules)** โดยแยกแต่ละโดเมนการทำงานออกเป็นโฟลเดอร์ย่อยที่เป็นอิสระต่อกัน ช่วยให้ค้นหา แก้ไข และดูแลรักษาโค้ดได้ง่าย ไม่ปะปนกัน

## โครงสร้างภายในแต่ละ Module

แต่ละโมดูลประกอบด้วย 3 ส่วนหลัก:
1. **`*.routes.ts`** — กำหนดเส้นทาง URL (Endpoint), การผูก Middleware ตรวจสอบสิทธิ์ (`authenticate`, `requireAdmin`, `requireStaff`), Rate Limiter และการผูก `validateBody`
2. **`*.controller.ts`** — จัดการ Business Logic และการเรียกใช้งานฐานข้อมูลผ่าน Drizzle ORM
3. **`*.schema.ts`** — กำหนดโครงสร้างการตรวจสอบข้อมูลขาเข้าด้วย **Zod Schema** พร้อม TypeScript Types อัตโนมัติ (`z.infer`)

## รายชื่อ Modules ทั้งหมด

- **`auth/`** — ระบบเข้าสู่ระบบ (`POST /login`), ออกจากระบบ (`POST /logout`), และตรวจสอบสถานะปัจจุบัน (`GET /me`) ผ่าน HttpOnly Cookie
- **`categories/`** — จัดการหมวดหมู่สินค้าซ่อม (`Computer`, `Laptop`, `Phone`) พร้อม In-memory Cache
- **`services/`** — จัดการรายการบริการซ่อม ราคา รายละเอียด รูปภาพ และสถานะเปิด/ปิดรับซ่อม
- **`inbox/`** — จัดการใบแจ้งซ่อมของลูกค้า การมอบหมายช่าง สถานะงานซ่อม (`pending`, `in_progress`, `completed`) โค้ดส่วนลด และการล็อกราคาสุทธิ (`final_price`)
- **`users/`** — จัดการบัญชีผู้ใช้งานระบบหลังบ้าน (`admin` และ `technician`) และการเข้ารหัสรหัสผ่านด้วย `bcrypt`
- **`dashboard/`** — คำนวณสถิติภาพรวม รายรับรายสัปดาห์/รายเดือน สัดส่วนตามหมวดหมู่ และตารางประสิทธิภาพการทำงานของช่างแต่ละคน

