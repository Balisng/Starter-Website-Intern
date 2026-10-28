import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { categories, inboxMessages, services } from '../db/schema';
import { CreateInboxMessageInput, UpdateInboxStatusInput } from '../validators/inbox.schema';

/**
 * POST /api/inbox
 * ลูกค้าส่งข้อมูลติดต่อ/แจ้งซ่อม (Public API จากหน้า About Me / Contact Us)
 * รองรับทั้งกรณีเลือกบริการมาล่วงหน้า และกรณี "ไม่แน่ใจอาการ / ปรึกษาช่างก่อน (service_id เป็น null)"
 */
export async function createInboxMessage(req: Request, res: Response): Promise<void> {
  try {
    const input: CreateInboxMessageInput = req.body;

    let validServiceId: number | null = null;

    // หากเลือกระบุ service_id มา ให้ตรวจสอบว่าบริการมีอยู่จริง
    if (input.service_id) {
      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, input.service_id))
        .limit(1);

      if (!service) {
        res.status(400).json({
          success: false,
          message: 'ไม่พบบริการที่เลือก (Invalid service_id)',
        });
        return;
      }
      validServiceId = service.id;
    }

    const [newMessage] = await db
      .insert(inboxMessages)
      .values({
        service_id: validServiceId,
        cm_username: input.cm_username,
        cm_cel: input.cm_cel,
        cm_email: input.cm_email,
        cm_symptom: input.cm_symptom,
        cm_image: input.cm_image || null,
        is_read: false,
        repair_status: 'pending',
        created_at: new Date(),
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว ช่างจะติดต่อกลับโดยเร็ว',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error creating inbox message:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการส่งข้อความแจ้งซ่อม',
    });
  }
}

/**
 * GET /api/inbox
 * ดึงรายการข้อความแจ้งซ่อมทั้งหมด (เฉพาะ Admin และ ช่าง)
 * รองรับ Filter:
 * - ?read_status=read | unread | all
 * - ?repair_status=pending | completed
 * - ?category_id=1, 2, 3... | all (กรองตามหมวดหมู่ช่าง)
 * - ?service_id=1, 2, 3... | unassigned | all (กรองตามบริการ หรือเคสไม่ระบุบริการ)
 * - ?search=คำค้นหา (ชื่อ, เบอร์, อีเมล, อาการ)
 */
export async function getAllInboxMessages(req: Request, res: Response): Promise<void> {
  try {
    const { read_status, repair_status, search, category_id, service_id } = req.query;

    const conditions = [];

    // กรองตามสถานะการอ่าน
    if (read_status === 'read') {
      conditions.push(eq(inboxMessages.is_read, true));
    } else if (read_status === 'unread') {
      conditions.push(eq(inboxMessages.is_read, false));
    }

    // กรองตามสถานะการซ่อม
    if (repair_status === 'pending' || repair_status === 'completed') {
      conditions.push(eq(inboxMessages.repair_status, repair_status));
    }

    // กรองตามหมวดหมู่สินค้า/บริการ (สำหรับช่างแต่ละด้าน)
    if (category_id && category_id !== 'all') {
      conditions.push(eq(categories.cg_id, Number(category_id)));
    }

    // กรองตามบริการ หรือเฉพาะรายการที่ยังไม่ได้ระบุบริการ (service_id IS NULL)
    if (service_id) {
      if (service_id === 'unassigned' || service_id === 'null') {
        conditions.push(sql`${inboxMessages.service_id} IS NULL`);
      } else if (service_id !== 'all') {
        conditions.push(eq(inboxMessages.service_id, Number(service_id)));
      }
    }

    // ค้นหาตามคำค้นหา (Case-insensitive)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const keyword = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(inboxMessages.cm_username, keyword),
          ilike(inboxMessages.cm_cel, keyword),
          ilike(inboxMessages.cm_email, keyword),
          ilike(inboxMessages.cm_symptom, keyword)
        )
      );
    }

    const query = db
      .select({
        cm_id: inboxMessages.cm_id,
        service_id: inboxMessages.service_id,
        service_name: services.name,
        service_price: services.price,
        service_image: services.service_image,
        category_id: categories.cg_id,
        category_name: categories.cg_name,
        cm_username: inboxMessages.cm_username,
        cm_cel: inboxMessages.cm_cel,
        cm_email: inboxMessages.cm_email,
        cm_symptom: inboxMessages.cm_symptom,
        cm_image: inboxMessages.cm_image,
        is_read: inboxMessages.is_read,
        repair_status: inboxMessages.repair_status,
        comment: inboxMessages.comment,
        created_at: inboxMessages.created_at,
      })
      .from(inboxMessages)
      .leftJoin(services, eq(inboxMessages.service_id, services.id))
      .leftJoin(categories, eq(services.cg_id, categories.cg_id))
      .orderBy(desc(inboxMessages.created_at));

    const result = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching inbox messages:', error);
    res.status(500).json({
      success: false,
      message: 'ไม่สามารถดึงรายการข้อความแจ้งซ่อมได้',
    });
  }
}

/**
 * GET /api/inbox/:id
 * ดึงรายละเอียดข้อความ 1 รายการ และเปลี่ยนเป็น "อ่านแล้ว (is_read = true)" โดยอัตโนมัติ
 */
export async function getInboxMessageById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสข้อความไม่ถูกต้อง' });
      return;
    }

    // อัปเดตสถานะเป็น "อ่านแล้ว" อัตโนมัติเมื่อเปิดดู
    await db
      .update(inboxMessages)
      .set({ is_read: true })
      .where(eq(inboxMessages.cm_id, id));

    const [message] = await db
      .select({
        cm_id: inboxMessages.cm_id,
        service_id: inboxMessages.service_id,
        service_name: services.name,
        service_price: services.price,
        service_image: services.service_image,
        category_id: categories.cg_id,
        category_name: categories.cg_name,
        cm_username: inboxMessages.cm_username,
        cm_cel: inboxMessages.cm_cel,
        cm_email: inboxMessages.cm_email,
        cm_symptom: inboxMessages.cm_symptom,
        cm_image: inboxMessages.cm_image,
        is_read: inboxMessages.is_read,
        repair_status: inboxMessages.repair_status,
        comment: inboxMessages.comment,
        created_at: inboxMessages.created_at,
      })
      .from(inboxMessages)
      .leftJoin(services, eq(inboxMessages.service_id, services.id))
      .leftJoin(categories, eq(services.cg_id, categories.cg_id))
      .where(eq(inboxMessages.cm_id, id))
      .limit(1);

    if (!message) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อความแจ้งซ่อมนี้' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...message,
        is_read: true,
      },
    });
  } catch (error) {
    console.error('Error fetching inbox message:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลข้อความ',
    });
  }
}

/**
 * PATCH /api/inbox/:id/status
 * อัปเดตสถานะการซ่อม (รอซ่อม / ซ่อมเสร็จแล้ว) และบันทึกบริการที่ซ่อมจริง (Service) หรือความคิดเห็นช่าง
 */
export async function updateInboxMessageStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสข้อความไม่ถูกต้อง' });
      return;
    }

    const input: UpdateInboxStatusInput = req.body;

    const [existing] = await db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.cm_id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อความแจ้งซ่อมนี้' });
      return;
    }

    // ตรวจสอบสถานะและ service_id หลังการอัปเดต
    const targetServiceId = input.service_id !== undefined ? input.service_id : existing.service_id;
    const targetRepairStatus = input.repair_status || existing.repair_status;

    // กฎสำคัญมาก: หากจะเปลี่ยนสถานะเป็น "ซ่อมเสร็จแล้ว (completed)" ต้องมีการเลือกผูก Service ที่ซ่อมจริงก่อน (ห้ามปล่อย service_id เป็น null)
    if (targetRepairStatus === 'completed' && !targetServiceId) {
      res.status(400).json({
        success: false,
        message: 'กรุณาเลือกบริการที่ซ่อมจริงก่อนเปลี่ยนสถานะเป็น "ซ่อมเสร็จแล้ว" เพื่อให้ระบบคำนวณรายรับใน Dashboard ได้ถูกต้อง',
      });
      return;
    }

    // หากมีการระบุ service_id ที่ไม่ใช่ null ให้ตรวจเช็กว่ามีอยู่จริง
    if (input.service_id) {
      const [srv] = await db
        .select()
        .from(services)
        .where(eq(services.id, input.service_id))
        .limit(1);

      if (!srv) {
        res.status(400).json({
          success: false,
          message: 'ไม่พบบริการที่เลือก (Invalid service_id)',
        });
        return;
      }
    }

    const [updated] = await db
      .update(inboxMessages)
      .set(input)
      .where(eq(inboxMessages.cm_id, id))
      .returning();

    res.json({
      success: true,
      message: 'อัปเดตสถานะงานซ่อมเรียบร้อยแล้ว',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating inbox status:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะงานซ่อม',
    });
  }
}

/**
 * DELETE /api/inbox/:id
 * ลบข้อความแจ้งซ่อม
 */
export async function deleteInboxMessage(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสข้อความไม่ถูกต้อง' });
      return;
    }

    const [deleted] = await db
      .delete(inboxMessages)
      .where(eq(inboxMessages.cm_id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อความแจ้งซ่อมที่ต้องการลบ' });
      return;
    }

    res.json({
      success: true,
      message: 'ลบข้อความแจ้งซ่อมสำเร็จ',
    });
  } catch (error) {
    console.error('Error deleting inbox message:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบข้อความ',
    });
  }
}
