import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { client, db } from '../config/db';
import { categories, services, users } from './schema';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // ----------------------------------------------------
    // 1. Seed Categories (Computer, Laptop, Phone)
    // ----------------------------------------------------
    console.log('📁 Checking and seeding Categories...');
    const defaultCategories = ['Computer', 'Laptop', 'Phone'];

    for (const catName of defaultCategories) {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.cg_name, catName))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(categories).values({
          cg_name: catName,
        });
        console.log(`   ➕ Inserted Category: "${catName}"`);
      } else {
        console.log(`   ℹ️ Category "${catName}" already exists (ID: ${existing[0].cg_id})`);
      }
    }

    // ----------------------------------------------------
    // 2. Seed Default Admin User (Admin / 1234)
    // ----------------------------------------------------
    console.log('👤 Checking and seeding Default Admin User...');
    const adminUsername = 'Admin';
    const rawPassword = '1234';

    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, adminUsername))
      .limit(1);

    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const [newAdmin] = await db
        .insert(users)
        .values({
          username: adminUsername,
          pwd: hashedPassword,
          u_name: 'System',
          u_surname: 'Admin',
          role: 'admin',
          cel: '0812345678',
          email: 'admin@repairservice.com',
        })
        .returning();

      console.log(`   ✅ Default Admin created successfully!`);
      console.log(`      - Username: ${newAdmin.username}`);
      console.log(`      - Password: ${rawPassword} (stored as bcrypt hash)`);
      console.log(`      - Role: ${newAdmin.role}`);
    } else {
      console.log(`   ℹ️ Admin user "${adminUsername}" already exists (ID: ${existingAdmin[0].u_id})`);
    }

    // Default Technician (for testing role restrictions)
    const techUsername = 'TechSomchai';
    const existingTech = await db
      .select()
      .from(users)
      .where(eq(users.username, techUsername))
      .limit(1);

    if (existingTech.length === 0) {
      const techHashedPwd = await bcrypt.hash('1234', 10);
      const [newTech] = await db
        .insert(users)
        .values({
          username: techUsername,
          pwd: techHashedPwd,
          u_name: 'สมชาย',
          u_surname: 'ช่างซ่อม',
          role: 'technician',
          cel: '0899876543',
          email: 'somchai.tech@fixpulsecare.com',
        })
        .returning();

      console.log(`   ✅ Default Technician created successfully!`);
      console.log(`      - Username: ${newTech.username}`);
      console.log(`      - Password: 1234`);
      console.log(`      - Role: ${newTech.role}`);
    } else {
      console.log(`   ℹ️ Technician "${techUsername}" already exists (ID: ${existingTech[0].u_id})`);
    }

    // ----------------------------------------------------
    // 3. Seed Initial Services (if empty)
    // ----------------------------------------------------
    console.log('🛠️ Checking and seeding Initial Services...');
    const existingServices = await db.select().from(services);

    if (existingServices.length < 3) {
      const allCategories = await db.select().from(categories);
      const catMap = new Map(allCategories.map((c) => [c.cg_name, c.cg_id]));

      const defaultServices = [
        {
          cg_id: catMap.get('Computer') || 1,
          name: 'ตรวจเช็ค ซ่อมเมนบอร์ด PC & เปลี่ยนชิปเซ็ต',
          detail: 'ตรวจเช็คภาคจ่ายไฟ อาการเปิดไม่ติด ดับเอง ด้วยเครื่องมือวิเคราะห์ระดับชิปเซ็ต พร้อมทำความสะอาดและทาซิลิโคนระบายความร้อนเกรดพรีเมียม',
          price: 1800,
          status: true,
          service_image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80',
        },
        {
          cg_id: catMap.get('Computer') || 1,
          name: 'บริการติดตั้งระบบ OS แท้ & กู้คืนข้อมูล (Data Recovery)',
          detail: 'ลงระบบปฏิบัติการ Windows/Linux แท้ อัปเดตไดรเวอร์ล่าสุด พร้อมบริการกู้คืนข้อมูลฮาร์ดดิสก์และ SSD ที่กู้ยาก ปลอดภัยข้อมูลไม่รั่วไหล',
          price: 650,
          status: true,
          service_image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80',
        },
        {
          cg_id: catMap.get('Laptop') || 2,
          name: 'ซ่อมเมนบอร์ดแล็ปท็อป เปิดไม่ติด / โดนน้ำ (MacBook & Notebook)',
          detail: 'ซ่อมแซมแผงวงจร ล้างคราบอ๊อกไซด์ ไล่ลายวงจรด้วยกล้องไมโครสโคปความแม่นยำสูง รับประกันงานซ่อมนาน 90 วัน',
          price: 2500,
          status: true,
          service_image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
        },
        {
          cg_id: catMap.get('Laptop') || 2,
          name: 'เปลี่ยนแบตเตอรี่แท้ & เปลี่ยนหน้าจอแล็ปท็อป Full HD/OLED',
          detail: 'เปลี่ยนแบตเตอรี่มาตรฐาน มอก. ไม่บวม ปลอดภัย 100% พร้อมบริการเปลี่ยนจอแตก จอดับ เป็นเส้น รอรับได้เลยในวันเดียว',
          price: 1950,
          status: true,
          service_image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
        },
        {
          cg_id: catMap.get('Phone') || 3,
          name: 'เปลี่ยนหน้าจอแท้ iPhone / Samsung / iPad ทัชสกรีนแท้',
          detail: 'เปลี่ยนชุดหน้าจอแท้ แสดงผลคมชัด สีสันสมจริง ระบบสัมผัสลื่นไหล มีประกันหน้าจอ ไม่ทิ้งคราบกาว',
          price: 1500,
          status: true,
          service_image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
        },
        {
          cg_id: catMap.get('Phone') || 3,
          name: 'ซ่อมพอร์ตชาร์จ ลำโพงเสียงแตก และเปลี่ยนบอดี้สมาร์ตโฟน',
          detail: 'แก้ไขปัญหาชาร์จไฟไม่เข้า พอร์ตชาร์จหลวม ลำโพงสนทนาไม่ได้ยิน และเปลี่ยนกระจกหลังเครื่องงานประณีต',
          price: 850,
          status: true,
          service_image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
        },
      ];

      for (const s of defaultServices) {
        await db.insert(services).values(s);
        console.log(`   ➕ Inserted Service: "${s.name}"`);
      }
    } else {
      console.log(`   ℹ️ Services already exist (${existingServices.length} items).`);
    }

    console.log('✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    // Gracefully close postgres client connection
    await client.end();
  }
}

seed();
