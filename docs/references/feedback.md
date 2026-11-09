จุดดี: แยก layer ชัด, auth ทำถูกทาง (HttpOnly cookie, bcrypt, error ไม่บอกว่าผิดช่องไหน), ใช้ Zod + role middleware, query ผ่าน Drizzle กัน SQL injection, มี guard กันปิดงานโดยไม่มี service_id, README ละเอียด

ต้องแก้ (เรียงจากหนักไปเบา):

JWT secret มี fallback ฝังในโค้ดและอยู่ใน README → ถ้าไม่มี env ให้ server ไม่ยอมสตาร์ท
CORS เปิดทุก origin พร้อม credentials → ใช้ whitelist จาก CLIENT_URL
รายรับดึงราคาปัจจุบันของ service → แก้ราคาหรือลบบริการแล้วยอดย้อนหลังเพี้ยน ต้องเก็บ final_price กับ completed_at ตอนปิดงาน
ไม่มี rate limit ที่ /auth/login และ POST /inbox
seed เป็น Admin/1234 และอยู่ใน README → อ่านจาก env
ช่างลบ ticket ได้ → ให้ลบได้เฉพาะ admin และช่างแก้ได้เฉพาะงานของตัวเอง
JWT อายุ 7 วันเก็บ role ไว้ ถ้าไม่เช็ก DB ซ้ำ ลบ/เปลี่ยน role แล้ว token เก่ายังใช้ได้ (ยังไม่ได้เช็ก middleware)

DB: role/status ควรเป็น enum, ไม่มี index บนคอลัมน์ที่ filter, ลบ category แล้ว cascade ลบ services ทิ้งหมด, README กับ schema ไม่ตรงกัน

จุดเล็ก: GET /inbox/:id มี side effect (ควรเป็น PATCH), mount route ซ้ำ / กับ /api เพื่อแก้ Vercel, รูปแนบเป็นแค่ URL (รับได้สำหรับ STARTER)