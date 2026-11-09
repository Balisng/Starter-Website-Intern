import { asc, eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../../config/db';
import { categories, Category } from '../../db/schema';
import { CreateCategoryInput } from './categories.schema';

let categoriesCache: { data: Category[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000;

export function clearCategoriesCache(): void {
  categoriesCache = null;
}

/**
 * GET /api/categories
 * ดึงรายการหมวดหมู่ทั้งหมด (Computer, Laptop, Phone) พร้อม In-memory Cache เพื่อลด Latency บน Vercel
 */
export async function getAllCategories(req: Request, res: Response): Promise<void> {
  try {
    const forceFresh = req.query.fresh === '1' || req.query.fresh === 'true';
    const now = Date.now();

    if (!forceFresh && categoriesCache && categoriesCache.expiresAt > now) {
      res.json({
        success: true,
        data: categoriesCache.data,
      });
      return;
    }

    const list = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.cg_id));

    categoriesCache = {
      data: list,
      expiresAt: now + CACHE_TTL_MS,
    };

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
    const input: CreateCategoryInput = req.body;

    const [newCategory] = await db
      .insert(categories)
      .values({ cg_name: input.cg_name })
      .returning();

    clearCategoriesCache();

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

