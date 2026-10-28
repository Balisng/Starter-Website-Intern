# 🛠️ Fix Please - Electronic Repair Service & Management System

ระบบแจ้งซ่อมและบริหารจัดการงานซ่อมอุปกรณ์อิเล็กทรอนิกส์ (Computer, Laptop, Smartphone) ครบวงจร พัฒนาด้วยสถาปัตยกรรมแยกระหว่าง Frontend (React + Vite + Tailwind CSS v4) และ Backend (Bun + Express + TypeScript + Drizzle ORM + PostgreSQL) พร้อมระบบยืนยันตัวตนด้วย HttpOnly Cookie และการแบ่งสิทธิ์ผู้ใช้งาน (Role-Based Access Control)

---

## 📋 สารบัญ (Table of Contents)
1. [ภาพรวมของระบบและบทบาทผู้ใช้งาน (System Overview & Roles)](#-ภาพรวมของระบบและบทบาทผู้ใช้งาน)
2. [โครงสร้างโปรเจกต์ (Project Structure)](#-โครงสร้างโปรเจกต์)
3. [ความต้องการของระบบ (System Requirements)](#-ความต้องการของระบบ)
4. [ขั้นตอนการติดตั้งและเริ่มใช้งาน (Getting Started)](#-ขั้นตอนการติดตั้งและเริ่มใช้งาน)
5. [การจัดการฐานข้อมูล (Database & Drizzle ORM)](#-การจัดการฐานข้อมูล)
6. [ตารางสรุป API Endpoints (API Documentation)](#-ตารางสรุป-api-endpoints)
7. [สถาปัตยกรรมความปลอดภัยและการคำนวณรายรับ (Security & Revenue Logic)](#-สถาปัตยกรรมความปลอดภัยและการคำนวณรายรับ)

---

## 🌟 ภาพรวมของระบบและบทบาทผู้ใช้งาน

### 1. ลูกค้าทั่วไป (Public Customers)
- **หน้าหลัก (Home):** ค้นหาบริการเด่น ดูหมวดหมู่การซ่อม ข้อดีของศูนย์บริการ และคลิกเพื่อแจ้งซ่อมได้ทันที
- **หน้ารวมบริการ (Services):** เลือกดูบริการซ่อมทั้งหมด ค้นหาตามชื่อ กรองตามหมวดหมู่ (Computer, Laptop, Phone) และกดปุ่ม *"ส่งซ่อมบริการนี้"* เพื่อส่งต่อไปยังฟอร์มแจ้งซ่อม
- **หน้าติดต่อเรา / แบบฟอร์มแจ้งซ่อม (About Me & Contact Us):**
  - **กรณีเข้าโดยตรง:** กรอกแบบฟอร์มได้ทันที และเลือกบริการที่ต้องการซ่อมจาก Dropdown โดยมีตัวเลือก *"ไม่แน่ใจอาการ / ปรึกษาช่างก่อน (ประเมินภายหลัง)"* ซึ่งจะส่งค่า `service_id` เป็น `null`
  - **กรณีกดมาจากหน้า Services/Home:** ระบบจะเลือก (Pre-selected) บริการนั้นๆ ใน Dropdown ให้อัตโนมัติ
  - รองรับการกรอกข้อมูลลูกค้า (ชื่อ, เบอร์โทร, อีเมล, อาการเสีย) และแนบ URL รูปถ่ายความเสียหาย
- **ดูรูปภาพขยาย (Image Lightbox):** สามารถคลิกดูรูปภาพประกอบการซ่อมหรือรูปที่แนบมาแบบเต็มจอได้

### 2. ช่างซ่อม (Technician)
- เข้าสู่ระบบผ่านหน้า `/login`
- **สิทธิ์การเข้าถึง:** เข้าถึงได้เฉพาะ **"กล่องข้อความแจ้งซ่อม (Admin Inbox)"** (`/admin/inbox`) เท่านั้น (ระบบจะทำการ Redirect ป้องกันการเข้าหน้าอื่นอัตโนมัติ)
- **ระบบกรองงานสำหรับช่าง:**
  - กรองงานตามหมวดหมู่ที่ตนเองรับผิดชอบ (Computer, Laptop, Phone)
  - กรองเฉพาะงานที่ *"ยังไม่ระบุบริการ (ลูกค้าไม่แน่ใจอาการ / null)"* เพื่อนำมาตรวจเช็ก
- **การจัดการงานซ่อม:**
  - เปิดอ่านรายละเอียดของ Ticket (ระบบจะเปลี่ยนเป็นสถานะ "อ่านแล้ว" อัตโนมัติ)
  - ดูรูปภาพสินค้าที่ลูกค้าแนบมาผ่าน Lightbox
  - **เลือก/ผูกบริการที่ซ่อมจริง (Service Assignment):** ช่างสามารถเลือกบริการจริงที่ดำเนินการซ่อม เพื่อผูกราคากับระบบ
  - **บันทึกสถานะงานซ่อม:** เปลี่ยนสถานะเป็น *รอซ่อม (Pending)* หรือ *ซ่อมเสร็จแล้ว (Completed)* พร้อมใส่บันทึกความคิดเห็นของช่าง
  - **Validation Guard:** ป้องกันไม่ให้ช่างเปลี่ยนสถานะเป็น "ซ่อมเสร็จแล้ว" หากยังไม่ได้เลือกผูกบริการจริง เพื่อป้องกันระบบคำนวณรายรับใน Dashboard ผิดพลาด

### 3. ผู้ดูแลระบบ (Admin)
- มีสิทธิ์เข้าถึงระบบหลังบ้านครบทุกฟังก์ชัน (Full Access):
  1. **Dashboard (แดชบอร์ด):** สรุปยอดรายรับทั้งหมด, รายสัปดาห์ (7 วัน), รายเดือน (30 วัน), จำนวนงานที่ซ่อมเสร็จ, จำนวนงานรอซ่อม, จำนวนช่างในระบบ, กราฟสัดส่วนรายรับตามหมวดหมู่, และรายการกิจกรรมงานซ่อมล่าสุด
  2. **จัดการบริการ (Services Management):** เพิ่ม, แก้ไข, ลบ, ค้นหา, กรอง และสลับสถานะเปิด/ปิดบริการซ่อม
  3. **กล่องข้อความแจ้งซ่อม (Inbox):** ค้นหา, กรองงานตามช่าง, มอบหมายบริการ, อัปเดตสถานะ, และลบข้อความ
  4. **จัดการผู้ใช้งาน (User Management):** เพิ่ม, แก้ไข, ลบผู้ใช้งานในระบบ กำหนด Role เป็น Admin หรือ ช่าง (Technician) พร้อมระบบตรวจสอบ Username ซ้ำ

---

## 📁 โครงสร้างโปรเจกต์

```text
291069Starter/
├── backend/                        # ฝั่ง Backend (Bun + Express + Drizzle ORM)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts               # การเชื่อมต่อ PostgreSQL (postgres.js + drizzle)
│   │   ├── controllers/            # Controller จัดการ Logic แต่ละ Entity
│   │   │   ├── auth.controller.ts        # ล็อกอิน, ล็อกเอาต์, ตรวจสอบ session (/api/auth)
│   │   │   ├── categories.controller.ts  # จัดการหมวดหมู่สินค้า (/api/categories)
│   │   │   ├── dashboard.controller.ts   # คำนวณรายได้และสถิติภาพรวม (/api/dashboard)
│   │   │   ├── inbox.controller.ts       # จัดการกล่องข้อความแจ้งซ่อม (/api/inbox)
│   │   │   ├── services.controller.ts    # จัดการรายการบริการซ่อม (/api/services)
│   │   │   └── users.controller.ts       # จัดการบัญชีผู้ใช้งาน Admin/ช่าง (/api/users)
│   │   ├── db/
│   │   │   ├── schema.ts           # โครงสร้างตาราง Database ทั้งหมด (Drizzle Schema)
│   │   │   └── seed.ts             # สคริปต์ Seeding ข้อมูลเริ่มต้น (Admin, ช่าง, Services)
│   │   ├── middlewares/            # Middleware ตรวจสอบสิทธิ์และดักจับ Error
│   │   │   ├── auth.middleware.ts        # ตรวจสอบ JWT Token จาก HttpOnly Cookie
│   │   │   ├── error.middleware.ts       # Global Error Handler
│   │   │   ├── role.middleware.ts        # เช็กสิทธิ์ requireAdmin, requireStaff
│   │   │   └── validate.middleware.ts    # ตรวจสอบ Request Body ด้วย Zod Schema
│   │   ├── routes/                 # Express Routers
│   │   │   ├── index.ts                  # รวม Route หลัก
│   │   │   ├── auth.routes.ts
│   │   │   ├── categories.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── inbox.routes.ts
│   │   │   ├── services.routes.ts
│   │   │   └── users.routes.ts
│   │   ├── types/                  # TypeScript Types / Interfaces
│   │   ├── validators/             # Zod Validation Schemas
│   │   └── index.ts                # จุดเริ่มต้นเซิร์ฟเวอร์ Express (Entry Point)
│   ├── .env                        # ไฟล์เก็บ Environment Variables (ห้าม commit)
│   ├── .env.example                # ไฟล์ตัวอย่าง Environment Variables
│   ├── drizzle.config.ts           # การตั้งค่า Drizzle Kit CLI
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # ฝั่ง Frontend (React + Vite + Tailwind CSS v4)
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts           # Fetch API Client พร้อมส่ง HttpOnly Cookie อัตโนมัติ
│   │   ├── assets/                 # รูปภาพและ Asset ของโปรเจกต์
│   │   ├── components/             # Reusable UI Components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx            # Navigation Bar หน้าบ้าน
│   │   │   │   └── Footer.tsx            # Footer หน้าบ้าน
│   │   │   └── ui/
│   │   │       └── ImageLightbox.tsx     # Popup ขยายรูปภาพแบบคมชัดเต็มจอ
│   │   ├── context/                # React Context Providers
│   │   │   ├── AuthContext.tsx           # จัดการ State ผู้ใช้งานและการล็อกอิน
│   │   │   └── ServiceContext.tsx        # ส่งต่อบริการที่เลือกไปยังแบบฟอร์ม Contact Us
│   │   ├── pages/                  # หน้าเพจทั้งหมด
│   │   │   ├── AboutMe/
│   │   │   │   └── AboutPage.tsx         # หน้าเกี่ยวกับเรา & ฟอร์มแจ้งซ่อม Contact Us
│   │   │   ├── Admin/
│   │   │   │   ├── AdminLayout.tsx       # โครงหน้าหลังบ้าน พร้อม Sidebar และการเช็ก Role
│   │   │   │   ├── AdminDashboard.tsx    # หน้าแสดงสถิติและรายรับ
│   │   │   │   ├── AdminInbox.tsx        # หน้ารายการแจ้งซ่อม, กรองงานช่าง, ผูกบริการ
│   │   │   │   ├── AdminServices.tsx     # หน้าจัดการบริการซ่อม
│   │   │   │   └── AdminUsers.tsx        # หน้าจัดการบัญชีผู้ใช้งาน Admin/ช่าง
│   │   │   ├── Home/
│   │   │   │   └── HomePage.tsx          # หน้าแรกของเว็บไซต์
│   │   │   ├── Login/
│   │   │   │   └── LoginPage.tsx         # หน้าเข้าสู่ระบบสำหรับ Admin และช่าง
│   │   │   └── Services/
│   │   │       └── ServicesPage.tsx      # หน้ารวมบริการซ่อมและค้นหา
│   │   ├── types/
│   │   │   └── index.ts            # Type definitions (Category, Service, User, InboxMessage)
│   │   ├── App.tsx                 # Route Configuration & Title Manager
│   │   ├── index.css               # Tailwind CSS v4 Styles
│   │   └── main.tsx                # React DOM Mount Point
│   ├── index.html                  # HTML Shell (Title: "Fix Please - บริการซ่อม...")
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts              # การตั้งค่า Vite และ Reverse Proxy ไปยัง Backend
│
└── README.md                       # คู่มือเอกสารระบบฉบับสมบูรณ์
```

---

## ⚙️ ความต้องการของระบบ (System Requirements)

- **Runtime:** [Bun](https://bun.sh/) (แนะนำเวอร์ชัน 1.1.0 ขึ้นไป) หรือ Node.js v18+
- **Database:** PostgreSQL (เวอร์ชัน 14 ขึ้นไป)
- **Browser:** รองรับ Google Chrome, Microsoft Edge, Safari, Firefox เวอร์ชันปัจจุบัน

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์หลักของโปรเจกต์:

```bash
# ติดตั้ง dependencies ฝั่ง Backend
cd backend
bun install

# ติดตั้ง dependencies ฝั่ง Frontend
cd ../frontend
bun install
```

### 2. ตั้งค่าไฟล์ Environment Variables (`.env`)
ในโฟลเดอร์ `backend/` ให้สร้างไฟล์ `.env` (หรือคัดลอกมาจาก `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# PostgreSQL Connection String (ปรับเปลี่ยนตาม User, Password, Port ของเครื่องคุณ)
DATABASE_URL=postgresql://postgres:secret@localhost:5433/repair_service_db

# JWT & Cookie Secret Key
JWT_SECRET=repair_service_secret_key_2026_change_in_production
```

### 3. เตรียมฐานข้อมูลและสร้างข้อมูลเริ่มต้น (Database Seed)
สร้าง Database ชื่อ `repair_service_db` ใน PostgreSQL ของท่าน จากนั้นรันคำสั่ง Seed:

```bash
cd backend
bun run db:seed
```

> **ข้อมูลเข้าสู่ระบบเริ่มต้น (Default Accounts):**
> - **Admin (สิทธิ์ผู้ดูแลระบบ):**
>   - Username: `Admin`
>   - Password: `1234`
> - **Technician (สิทธิ์ช่างซ่อม):**
>   - Username: `TechSomchai`
>   - Password: `1234`

### 4. รันระบบสำหรับการพัฒนา (Development Mode)

#### ⚡ วิธีที่ 1: รันคำสั่งเดียวพร้อมกันทั้งระบบ (One-liner Quick Start - แนะนำ)
เปิด Terminal ที่โฟลเดอร์หลัก (Root) แล้วพิมพ์:
```bash
bun run start:all
```
*(คำสั่งนี้จะสั่งรันทั้ง Backend พอร์ต 5000 และ Frontend พร้อมสั่ง `--open` เปิดเบราว์เซอร์เข้าหน้าเว็บตามพอร์ตจริงให้อัตโนมัติทันที)*

#### 🛠️ วิธีที่ 2: รันแยกทีละหน้าต่าง Terminal
**Terminal 1 (Backend - พอร์ต 5000):**
```bash
cd backend
bun run dev
```

**Terminal 2 (Frontend - พอร์ต 3000):**
```bash
cd frontend
bun run dev
```

เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

### 📦 คำสั่งสำรองข้อมูลโปรเจกต์ (Backup Code)
เมื่อต้องการย้ายเครื่องหรือแชร์เฉพาะโค้ดโปรเจกต์ สามารถพิมพ์คำสั่งเดียวที่ Root:
```bash
bun run backup
```
*(คำสั่งนี้จะบีบอัดเฉพาะโค้ดโปรเจกต์ออกมาเป็นไฟล์ `backup.zip` โดยคัดแยก `node_modules`, `.git` และไฟล์ zip เก่าออกโดยอัตโนมัติ ทำให้ไฟล์มีขนาดเล็กกะทัดรัดพร้อมนำไปใช้งานบนเครื่องอื่นทันที)*

---

## 🗄️ การจัดการฐานข้อมูล (Database & Drizzle ORM)

ระบบใช้ **Drizzle ORM** ร่วมกับไดรเวอร์ `postgres.js` ซึ่งมีคำสั่งจัดการฐานข้อมูลที่เตรียมไว้ใน `backend/package.json` ดังนี้:

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `bun run db:push` | ซิงค์ Drizzle Schema ไปยัง PostgreSQL ทันที (เหมาะกับช่วง Development) |
| `bun run db:generate` | สร้างไฟล์ SQL Migration ในโฟลเดอร์ `drizzle/` |
| `bun run db:migrate` | ดำเนินการรัน Migration ไปยังฐานข้อมูล |
| `bun run db:seed` | รันสคริปต์เพิ่ม Admin, ช่าง และบริการเริ่มต้นเข้าฐานข้อมูล |
| `bun run db:studio` | เปิด Drizzle Studio (GUI ตรวจสอบข้อมูลในเบราว์เซอร์) |

### โครงสร้างตาราง (Database Schema Summary):
1. **`categories` (หมวดหมู่สินค้า):** `cg_id` (PK, Serial), `cg_name` (Varchar 100)
2. **`services` (รายการบริการซ่อม):** `id` (PK, Serial), `cg_id` (FK), `name`, `detail`, `price`, `status`, `service_image`
3. **`users` (ผู้ใช้งานระบบ):** `u_id` (PK, Serial), `username` (Unique), `pwd` (Bcrypt Hash), `u_name`, `u_surname`, `role` (`admin` \| `technician`), `cel`, `email`
4. **`inbox_messages` (กล่องข้อความแจ้งซ่อม):** `cm_id` (PK, Serial), `service_id` (FK, Nullable), `cm_username`, `cm_cel`, `cm_email`, `cm_symptom`, `cm_image`, `is_read` (Boolean), `repair_status` (`pending` \| `completed`), `comment`, `created_at`

---

## 📡 ตารางสรุป API Endpoints

Base URL: `http://localhost:5000/api` (Frontend เรียกผ่าน Proxy `/api`)

### 1. Authentication (`/api/auth`)
| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | เข้าสู่ระบบ และเซ็ต HttpOnly Cookie (`auth_token`) | `{ "username": "Admin", "pwd": "..." }` |
| `POST` | `/api/auth/logout` | Authenticated | เคลียร์ HttpOnly Cookie ออกจากเบราว์เซอร์ | - |
| `GET` | `/api/auth/me` | Authenticated | ดึงข้อมูลผู้ใช้งานปัจจุบันที่กำลังล็อกอินอยู่ | - |

### 2. หมวดหมู่สินค้า (`/api/categories`)
| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | ดึงรายการหมวดหมู่ทั้งหมด | - |
| `GET` | `/api/categories/:id` | Public | ดึงรายละเอียดหมวดหมู่ตาม ID | - |
| `POST` | `/api/categories` | Admin Only | เพิ่มหมวดหมู่ใหม่ | `{ "cg_name": "Tablet" }` |

### 3. บริการซ่อม (`/api/services`)
| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย | Query / Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Public | ดึงรายการบริการทั้งหมด | Query: `?cg_id=1&status=true` |
| `GET` | `/api/services/:id` | Public | ดึงรายละเอียดบริการตาม ID | - |
| `POST` | `/api/services` | Admin Only | เพิ่มบริการซ่อมใหม่ | `{ "name": "...", "cg_id": 1, "price": 1500, "status": true, ... }` |
| `PUT` | `/api/services/:id` | Admin Only | แก้ไขข้อมูลบริการซ่อม | `{ "name": "...", "price": 1800, ... }` |
| `DELETE` | `/api/services/:id` | Admin Only | ลบบริการซ่อม | - |

### 4. กล่องข้อความแจ้งซ่อม (`/api/inbox`)
| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย | Query / Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/inbox` | Public | ลูกค้าส่งแบบฟอร์มแจ้งซ่อม (`service_id` เป็น `null` ได้) | `{ "cm_username": "...", "cm_cel": "...", "cm_symptom": "...", "service_id": null }` |
| `GET` | `/api/inbox` | Staff (Admin/ช่าง) | ดึงรายการแจ้งซ่อมทั้งหมด พร้อม Left Join ชื่อบริการและหมวดหมู่ | Query: `?read_status=unread&category_id=1&service_id=unassigned&search=...` |
| `GET` | `/api/inbox/:id` | Staff (Admin/ช่าง) | ดูรายละเอียด Ticket และเปลี่ยนสถานะเป็น "อ่านแล้ว" อัตโนมัติ | - |
| `PATCH` | `/api/inbox/:id/status`| Staff (Admin/ช่าง) | อัปเดตสถานะงาน (`repair_status`), ผูกบริการจริง (`service_id`), และบันทึกความคิดเห็นช่าง | `{ "repair_status": "completed", "service_id": 2, "comment": "..." }` |
| `DELETE` | `/api/inbox/:id` | Staff (Admin/ช่าง) | ลบข้อความแจ้งซ่อมออกจากระบบ | - |

### 5. ผู้ใช้งานระบบ (`/api/users`)
| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin Only | ดึงรายชื่อ Admin และช่างทั้งหมด | - |
| `GET` | `/api/users/:id` | Admin Only | ดึงข้อมูลผู้ใช้งานตาม ID | - |
| `POST` | `/api/users` | Admin Only | สร้างบัญชีผู้ใช้ใหม่ (เข้ารหัสผ่านด้วย bcrypt) | `{ "username": "...", "pwd": "...", "role": "technician", ... }` |
| `PUT` | `/api/users/:id` | Admin Only | แก้ไขข้อมูลผู้ใช้ (เปลี่ยนรหัสผ่านได้เมื่อระบุ) | `{ "u_name": "...", "role": "admin" }` |
| `DELETE` | `/api/users/:id` | Admin Only | ลบบัญชีผู้ใช้งาน | - |

### 6. แดชบอร์ดสรุปผล (`/api/dashboard`)
| Method | Endpoint | สิทธิ์เข้าถึง | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Admin Only | คำนวณสรุปยอดรายได้ (รวม/7วัน/30วัน), จำนวนงานซ่อมเสร็จ, จำนวนช่าง, จำนวนงานรอซ่อม, สัดส่วนรายได้แยกตามหมวดหมู่, และกิจกรรมล่าสุด |

---

## 🔒 สถาปัตยกรรมความปลอดภัยและการคำนวณรายรับ

1. **HttpOnly Cookie Authentication:**
   - ระบบเก็บ JWT Token ไว้ใน Cookie ที่มี Flag `httpOnly: true`, `sameSite: 'lax'` และ `path: '/'`
   - ป้องกันการโจมตีประเภท Cross-Site Scripting (XSS) และไม่เปิดเผย Token ลงบน `localStorage`
2. **Role-Based Access Control (RBAC):**
   - Middleware `requireAdmin` ป้องกัน Endpoint สำคัญ (Dashboard, Services, Users)
   - Middleware `requireStaff` อนุญาตทั้ง Admin และ ช่าง สำหรับระบบกล่องข้อความแจ้งซ่อม Inbox
   - หน้า Frontend มี `AdminLayout` ตรวจสอบและ Redirect ช่างให้เข้าถึงได้เฉพาะ `/admin/inbox`
3. **การคำนวณรายรับใน Dashboard (Revenue Integrity Guard):**
   - ยอดรายได้ในหน้า Dashboard คำนวณจาก `SUM(services.price)` เฉพาะรายการแจ้งซ่อมที่มีสถานะ `repair_status = 'completed'`
   - **Validation Guard:** ระบบดักจับทั้งในระดับ Backend Controller (`updateInboxMessageStatus`) และหน้าเว็บ Admin Inbox ไม่ให้สามารถเปลี่ยนสถานะเป็น `'completed'` ได้ หาก `service_id` ยังคงเป็น `null` ทำให้ระบบรับประกันความถูกต้องของการคำนวณรายรับ 100% เสมอ
