import { asc, eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { categories } from '../db/schema';

/**
 * GET /api/categories
 * ดึงรายการหมวดหมู่ทั้งหมด (Computer, Laptop, Phone)
 */
export async function getAllCategories(_req: Request, res: Response): Promise<void> {
  try {
    const list = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.cg_id));

    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้',
    });
  }
}

/**
 * GET /api/categories/:id
 * ดึงข้อมูลหมวดหมู่ตาม ID
 */
export async function getCategoryById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสหมวดหมู่ไม่ถูกต้อง' });
      return;
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.cg_id, id))
      .limit(1);

    if (!category) {
      res.status(404).json({ success: false, message: 'ไม่พบหมวดหมู่นี้' });
      return;
    }

    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
}

/**
 * POST /api/categories
 * เพิ่มหมวดหมู่ใหม่ (เฉพาะ Admin)
 */
export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const { cg_name } = req.body;
    if (!cg_name || typeof cg_name !== 'string' || cg_name.trim().length === 0) {
      res.status(400).json({ success: false, message: 'กรุณาระบุชื่อหมวดหมู่' });
      return;
    }

    const [newCategory] = await db
      .insert(categories)
      .values({ cg_name: cg_name.trim() })
      .returning();

    res.status(201).json({
      success: true,
      message: 'เพิ่มหมวดหมู่สำเร็จ',
      data: newCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างหมวดหมู่' });
  }
}
