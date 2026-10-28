# Controllers
โฟลเดอร์สำหรับเก็บ Business Logic แยกตามโมดูล:
- `auth.controller.ts`: จัดการ Login (เซ็ต Cookie), Logout, Get Current User
- `services.controller.ts`: จัดการ CRUD รายการบริการซ่อม
- `categories.controller.ts`: จัดการดึงหมวดหมู่บริการ (Computer, Laptop, Phone)
- `inbox.controller.ts`: จัดการรับเรื่องแจ้งซ่อมจากลูกค้า, อ่านข้อความ, อัปเดตสถานะการซ่อม
- `users.controller.ts`: จัดการรายชื่อผู้ใช้/ช่าง (เฉพาะ Admin เข้าถึงได้)
- `dashboard.controller.ts`: คำนวณสถิติ รายรับ รายสัปดาห์/เดือน จำนวนช่าง/ลูกค้า/งานซ่อม
