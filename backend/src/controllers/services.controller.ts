import { and, desc, eq } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { categories, services } from '../db/schema';
import { CreateServiceInput, UpdateServiceInput } from '../validators/service.schema';

/**
 * GET /api/services
 * ดึงรายการบริการทั้งหมด พร้อมข้อมูลหมวดหมู่
 * รองรับ Query: ?cg_id=1&status=true
 */
export async function getAllServices(req: Request, res: Response): Promise<void> {
  try {
    const cgIdQuery = req.query.cg_id ? parseInt(req.query.cg_id as string, 10) : undefined;
    const statusQuery = req.query.status !== undefined ? req.query.status === 'true' : undefined;

    // Build conditions
    const conditions = [];
    if (cgIdQuery && !isNaN(cgIdQuery)) {
      conditions.push(eq(services.cg_id, cgIdQuery));
    }
    if (statusQuery !== undefined) {
      conditions.push(eq(services.status, statusQuery));
    }

    const query = db
      .select({
        id: services.id,
        cg_id: services.cg_id,
        cg_name: categories.cg_name,
        name: services.name,
        detail: services.detail,
        price: services.price,
        status: services.status,
        service_image: services.service_image,
      })
      .from(services)
      .leftJoin(categories, eq(services.cg_id, categories.cg_id))
      .orderBy(desc(services.id));

    const result = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงข้อมูลรายการบริการได้',
    });
  }
}

/**
 * GET /api/services/:id
 * ดึงข้อมูลบริการรายการเดียว
 */
export async function getServiceById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสบริการไม่ถูกต้อง' });
      return;
    }

    const [service] = await db
      .select({
        id: services.id,
        cg_id: services.cg_id,
        cg_name: categories.cg_name,
        name: services.name,
        detail: services.detail,
        price: services.price,
        status: services.status,
        service_image: services.service_image,
      })
      .from(services)
      .leftJoin(categories, eq(services.cg_id, categories.cg_id))
      .where(eq(services.id, id))
      .limit(1);

    if (!service) {
      res.status(404).json({ success: false, message: 'ไม่พบรายการบริการนี้' });
      return;
    }

    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลบริการ' });
  }
}

/**
 * POST /api/services
 * เพิ่มรายการบริการใหม่ (เฉพาะ Admin)
 */
export async function createService(req: Request, res: Response): Promise<void> {
  try {
    const input: CreateServiceInput = req.body;

    // ตรวจสอบว่ามีหมวดหมู่อยู่จริงหรือไม่
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.cg_id, input.cg_id))
      .limit(1);

    if (!category) {
      res.status(400).json({
        success: false,
        message: 'ไม่พบหมวดหมู่บริการที่ระบุ (Invalid category cg_id)',
      });
      return;
    }

    const [newService] = await db
      .insert(services)
      .values({
        cg_id: input.cg_id,
        name: input.name,
        detail: input.detail,
        price: input.price,
        status: input.status ?? true,
        service_image: input.service_image,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'เพิ่มรายการบริการสำเร็จ',
      data: newService,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มบริการ' });
  }
}

/**
 * PUT /api/services/:id
 * แก้ไขรายการบริการ (เฉพาะ Admin)
 */
export async function updateService(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสบริการไม่ถูกต้อง' });
      return;
    }

    const input: UpdateServiceInput = req.body;

    // ตรวจสอบว่าบริการมีอยู่จริงหรือไม่
    const [existing] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, message: 'ไม่พบรายการบริการที่ต้องการแก้ไข' });
      return;
    }

    // ถ้ามีการเปลี่ยนหมวดหมู่ ให้เช็คว่าหมวดหมู่ใหม่มีอยู่จริงหรือไม่
    if (input.cg_id) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.cg_id, input.cg_id))
        .limit(1);

      if (!category) {
        res.status(400).json({ success: false, message: 'ไม่พบหมวดหมู่ที่ระบุ' });
        return;
      }
    }

    const [updated] = await db
      .update(services)
      .set(input)
      .where(eq(services.id, id))
      .returning();

    res.json({
      success: true,
      message: 'แก้ไขรายการบริการสำเร็จ',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขบริการ' });
  }
}

/**
 * DELETE /api/services/:id
 * ลบรายการบริการ (เฉพาะ Admin)
 */
export async function deleteService(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสบริการไม่ถูกต้อง' });
      return;
    }

    const [deleted] = await db
      .delete(services)
      .where(eq(services.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, message: 'ไม่พบรายการบริการที่ต้องการลบ' });
      return;
    }

    res.json({
      success: true,
      message: 'ลบรายการบริการสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบบริการ' });
  }
}
