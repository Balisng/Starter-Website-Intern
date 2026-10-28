# Zod Validators
โฟลเดอร์สำหรับ Zod Schema ในการ Validate Input ก่อนส่งเข้า Database:
- `auth.schema.ts`: ตรวจสอบ username, pwd ในหน้า Login
- `service.schema.ts`: ตรวจสอบการเพิ่ม/แก้ไข Service (ชื่อ, หมวดหมู่, ราคา, รายละเอียด, รูป)
- `inbox.schema.ts`: ตรวจสอบฟอร์มแจ้งซ่อมจากลูกค้า (ชื่อ, เบอร์, อีเมล, อาการ, รูป)
- `user.schema.ts`: ตรวจสอบการเพิ่ม/แก้ไข User และ Role
