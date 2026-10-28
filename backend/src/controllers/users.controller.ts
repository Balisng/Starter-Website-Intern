import bcrypt from 'bcryptjs';
import { desc, eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { users } from '../db/schema';
import { CreateUserInput, UpdateUserInput } from '../validators/user.schema';

/**
 * GET /api/users
 * ดึงรายชื่อผู้ใช้ทั้งหมด (เฉพาะ Admin) โดยไม่ส่งฟิลด์รหัสผ่านกลับไป
 */
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  try {
    const list = await db
      .select({
        u_id: users.u_id,
        username: users.username,
        u_name: users.u_name,
        u_surname: users.u_surname,
        role: users.role,
        cel: users.cel,
        email: users.email,
      })
      .from(users)
      .orderBy(desc(users.u_id));

    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้',
    });
  }
}

/**
 * GET /api/users/:id
 * ดึงข้อมูลผู้ใช้ตาม ID
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const [user] = await db
      .select({
        u_id: users.u_id,
        username: users.username,
        u_name: users.u_name,
        u_surname: users.u_surname,
        role: users.role,
        cel: users.cel,
        email: users.email,
      })
      .from(users)
      .where(eq(users.u_id, id))
      .limit(1);

    if (!user) {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้นี้' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
}

/**
 * POST /api/users
 * เพิ่มผู้ใช้งานใหม่ (เฉพาะ Admin)
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    const input: CreateUserInput = req.body;

    // ตรวจสอบ Username ซ้ำ
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.username, input.username))
      .limit(1);

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Username นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น',
      });
      return;
    }

    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(input.pwd, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        username: input.username,
        pwd: hashedPassword,
        u_name: input.u_name,
        u_surname: input.u_surname,
        role: input.role,
        cel: input.cel,
        email: input.email,
      })
      .returning({
        u_id: users.u_id,
        username: users.username,
        u_name: users.u_name,
        u_surname: users.u_surname,
        role: users.role,
        cel: users.cel,
        email: users.email,
      });

    res.status(201).json({
      success: true,
      message: 'เพิ่มผู้ใช้งานสำเร็จ',
      data: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน' });
  }
}

/**
 * PUT /api/users/:id
 * แก้ไขข้อมูลผู้ใช้และสิทธิ์การเข้าถึง (เฉพาะ Admin)
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    const input: UpdateUserInput = req.body;

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.u_id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการแก้ไข' });
      return;
    }

    // สร้าง payload สำหรับ update
    const updateData: any = { ...input };

    // ถ้ามีการเปลี่ยนรหัสผ่าน ให้แฮชใหม่
    if (input.pwd && input.pwd.trim() !== '') {
      updateData.pwd = await bcrypt.hash(input.pwd, 10);
    } else {
      delete updateData.pwd;
    }

    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.u_id, id))
      .returning({
        u_id: users.u_id,
        username: users.username,
        u_name: users.u_name,
        u_surname: users.u_surname,
        role: users.role,
        cel: users.cel,
        email: users.email,
      });

    res.json({
      success: true,
      message: 'แก้ไขข้อมูลผู้ใช้สำเร็จ',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' });
  }
}

/**
 * DELETE /api/users/:id
 * ลบผู้ใช้ (เฉพาะ Admin และป้องกันการลบตัวเอง)
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง' });
      return;
    }

    // ป้องกันแอดมินลบบัญชีตัวเอง
    if (req.user && req.user.u_id === id) {
      res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบบัญชีของตัวคุณเองที่กำลังล็อกอินอยู่ได้',
      });
      return;
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.u_id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้ที่ต้องการลบ' });
      return;
    }

    res.json({
      success: true,
      message: 'ลบผู้ใช้งานสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบผู้ใช้งาน' });
  }
}
