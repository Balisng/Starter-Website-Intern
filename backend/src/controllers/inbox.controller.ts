import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { categories, inboxMessages, services, users } from '../db/schema';
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
    let validPromoCode: string | null = null;
    let discountPercent = 0;

    if (input.promo_code && typeof input.promo_code === 'string') {
      const rawPromo = input.promo_code.trim().toUpperCase();
      if (rawPromo === 'HALLOWEEN20' || rawPromo === 'PROMO20' || rawPromo === 'FIX20') {
        validPromoCode = 'HALLOWEEN20';
        discountPercent = 20;
      }
    }

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
        promo_code: validPromoCode,
        discount_percent: discountPercent,
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
 */
export async function getAllInboxMessages(req: Request, res: Response): Promise<void> {
  try {
    const { read_status, repair_status, search, category_id, service_id, technician_id } = req.query;

    const conditions = [];

    // กรองตามสถานะการอ่าน
    if (read_status === 'read') {
      conditions.push(eq(inboxMessages.is_read, true));
    } else if (read_status === 'unread') {
      conditions.push(eq(inboxMessages.is_read, false));
    }

    // กรองตามสถานะการซ่อม ('active' = ยังไม่เสร็จ คือทั้ง pending และ in_progress)
    if (repair_status === 'active') {
      conditions.push(ne(inboxMessages.repair_status, 'completed'));
    } else if (
      repair_status === 'pending' ||
      repair_status === 'in_progress' ||
      repair_status === 'completed'
    ) {
      conditions.push(eq(inboxMessages.repair_status, repair_status));
    }

    // กรองตามหมวดหมู่สินค้า/บริการ
    if (category_id && category_id !== 'all') {
      conditions.push(eq(categories.cg_id, Number(category_id)));
    }

    // กรองตามบริการ หรือเฉพาะรายการที่ยังไม่ได้ระบุบริการ
    if (service_id) {
      if (service_id === 'unassigned' || service_id === 'null') {
        conditions.push(sql`${inboxMessages.service_id} IS NULL`);
      } else if (service_id !== 'all') {
        conditions.push(eq(inboxMessages.service_id, Number(service_id)));
      }
    }

    // กรองตามช่างผู้รับผิดชอบ
    if (technician_id) {
      if (technician_id === 'unassigned' || technician_id === 'null') {
        conditions.push(sql`${inboxMessages.technician_id} IS NULL`);
      } else if (technician_id !== 'all') {
        conditions.push(eq(inboxMessages.technician_id, Number(technician_id)));
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
        service_price: sql<number | null>`coalesce(${inboxMessages.final_price}, ${services.price})`,
        final_price: inboxMessages.final_price,
        completed_at: inboxMessages.completed_at,
        service_image: services.service_image,
        category_id: categories.cg_id,
        category_name: categories.cg_name,
        technician_id: inboxMessages.technician_id,
        technician_name: users.u_name,
        technician_surname: users.u_surname,
        cm_username: inboxMessages.cm_username,
        cm_cel: inboxMessages.cm_cel,
        cm_email: inboxMessages.cm_email,
        cm_symptom: inboxMessages.cm_symptom,
        cm_image: inboxMessages.cm_image,
        promo_code: inboxMessages.promo_code,
        discount_percent: inboxMessages.discount_percent,
        is_read: inboxMessages.is_read,
        repair_status: inboxMessages.repair_status,
        comment: inboxMessages.comment,
        created_at: inboxMessages.created_at,
      })
      .from(inboxMessages)
      .leftJoin(services, eq(inboxMessages.service_id, services.id))
      .leftJoin(categories, eq(services.cg_id, categories.cg_id))
      .leftJoin(users, eq(inboxMessages.technician_id, users.u_id))
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
 * ดึงรายละเอียดข้อความ 1 รายการ (ไม่มี Side Effect การแก้ไขข้อมูล)
 */
export async function getInboxMessageById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสข้อความไม่ถูกต้อง' });
      return;
    }

    const [message] = await db
      .select({
        cm_id: inboxMessages.cm_id,
        service_id: inboxMessages.service_id,
        service_name: services.name,
        service_price: sql<number | null>`coalesce(${inboxMessages.final_price}, ${services.price})`,
        final_price: inboxMessages.final_price,
        completed_at: inboxMessages.completed_at,
        service_image: services.service_image,
        category_id: categories.cg_id,
        category_name: categories.cg_name,
        technician_id: inboxMessages.technician_id,
        technician_name: users.u_name,
        technician_surname: users.u_surname,
        cm_username: inboxMessages.cm_username,
        cm_cel: inboxMessages.cm_cel,
        cm_email: inboxMessages.cm_email,
        cm_symptom: inboxMessages.cm_symptom,
        cm_image: inboxMessages.cm_image,
        promo_code: inboxMessages.promo_code,
        discount_percent: inboxMessages.discount_percent,
        is_read: inboxMessages.is_read,
        repair_status: inboxMessages.repair_status,
        comment: inboxMessages.comment,
        created_at: inboxMessages.created_at,
      })
      .from(inboxMessages)
      .leftJoin(services, eq(inboxMessages.service_id, services.id))
      .leftJoin(categories, eq(services.cg_id, categories.cg_id))
      .leftJoin(users, eq(inboxMessages.technician_id, users.u_id))
      .where(eq(inboxMessages.cm_id, id))
      .limit(1);

    if (!message) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อความแจ้งซ่อมนี้' });
      return;
    }

    res.json({
      success: true,
      data: message,
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
 * PATCH /api/inbox/:id/read
 * เปลี่ยนสถานะข้อความเป็น "อ่านแล้ว (is_read = true)" อย่างชัดเจนผ่าน PATCH
 */
export async function markInboxMessageAsRead(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสข้อความไม่ถูกต้อง' });
      return;
    }

    const [updated] = await db
      .update(inboxMessages)
      .set({ is_read: true })
      .where(eq(inboxMessages.cm_id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อความแจ้งซ่อมนี้' });
      return;
    }

    res.json({
      success: true,
      message: 'อัปเดตสถานะเป็นอ่านแล้ว',
      data: updated,
    });
  } catch (error) {
    console.error('Error marking inbox message as read:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะการอ่าน',
    });
  }
}

/**
 * PATCH /api/inbox/:id/status
 * อัปเดตสถานะการซ่อม ('pending' | 'in_progress' | 'completed') และมอบหมายช่างผู้รับผิดชอบ
 * - Admin: เลือก/เปลี่ยนช่างผู้รับผิดชอบงานได้ และปรับสถานะได้ทุกสถานะ
 * - Technician: เห็นช่างผู้รับผิดชอบแต่เปลี่ยนเป็นคนอื่นไม่ได้ สามารถกดรับงาน / อัปเดตสถานะการซ่อมได้
 * - เมื่อเปลี่ยนเป็น 'completed' ระบบจะบันทึก final_price และ completed_at ถาวร
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

    // กฎล็อกยอดขายถาวร: หากใบงานนี้ส่งมอบงานแล้ว (completed) ห้ามเปลี่ยนกลับเป็นสถานะอื่นหรือแก้บริการเด็ดขาด
    if (existing.repair_status === 'completed') {
      if (input.repair_status && input.repair_status !== 'completed') {
        res.status(400).json({
          success: false,
          message:
            'รายการนี้ส่งมอบงานเรียบร้อยแล้ว ไม่สามารถย้อนสถานะกลับเป็นรอดำเนินการได้',
        });
        return;
      }
      if (input.service_id !== undefined && input.service_id !== existing.service_id) {
        res.status(400).json({
          success: false,
          message:
            'รายการนี้ส่งมอบงานเรียบร้อยแล้ว ไม่สามารถเปลี่ยนแปลงรายการบริการหรือราคาได้',
        });
        return;
      }
    }

    // กฎสิทธิ์สำหรับช่าง: ช่างสามารถอัปเดตสถานะได้เฉพาะงานที่มอบหมายให้ตนเอง หรืองานที่ยังไม่มีผู้รับผิดชอบเท่านั้น
    if (
      req.user?.role === 'technician' &&
      existing.technician_id !== null &&
      existing.technician_id !== req.user.u_id
    ) {
      res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์แก้ไขงานซ่อมนี้ เนื่องจากเป็นงานที่อยู่ในความรับผิดชอบของช่างท่านอื่น',
      });
      return;
    }

    const targetServiceId = input.service_id !== undefined ? input.service_id : existing.service_id;
    const targetRepairStatus = input.repair_status || existing.repair_status;

    if (targetRepairStatus === 'completed' && !targetServiceId) {
      res.status(400).json({
        success: false,
        message:
          'กรุณาเลือกบริการที่ดำเนินการซ่อมก่อนกดส่งมอบงาน เพื่อบันทึกข้อมูลลงในประวัติงานซ่อม',
      });
      return;
    }

    // จัดการ technician_id: เฉพาะ Admin เท่านั้นที่เลือก/เปลี่ยนช่างผู้รับผิดชอบได้โดยอิสระ
    // ส่วนช่าง (technician) หากรับงานที่ยังว่างอยู่ ระบบจะผูกชื่อช่างคนนั้นให้อัตโนมัติ แต่ไม่สามารถเปลี่ยนชื่อผู้รับผิดชอบเป็นคนอื่นได้
    let targetTechnicianId: number | null | undefined = existing.technician_id;
    if (req.user?.role === 'admin') {
      if (input.technician_id !== undefined) {
        targetTechnicianId = input.technician_id;
      }
    } else if (req.user?.role === 'technician') {
      if (!existing.technician_id) {
        targetTechnicianId = req.user.u_id;
      }
    }

    if (targetRepairStatus === 'completed' && !targetTechnicianId) {
      res.status(400).json({
        success: false,
        message:
          'กรุณาระบุช่างผู้รับผิดชอบงานซ่อมก่อนส่งมอบงาน เพื่อบันทึกในประวัติผลงานช่าง',
      });
      return;
    }

    // ตรวจสอบข้อมูลช่างและบริการแบบขนาน (Parallel Validation)
    const [techResult, srvResult] = await Promise.all([
      targetTechnicianId
        ? db.select().from(users).where(eq(users.u_id, targetTechnicianId)).limit(1)
        : Promise.resolve([]),
      targetServiceId
        ? db.select().from(services).where(eq(services.id, targetServiceId)).limit(1)
        : Promise.resolve([]),
    ]);

    if (targetTechnicianId && !techResult[0]) {
      res.status(400).json({
        success: false,
        message: 'ไม่พบข้อมูลช่างที่ระบุในระบบ',
      });
      return;
    }

    let selectedServicePrice: number | null = null;
    if (targetServiceId) {
      if (!srvResult[0]) {
        res.status(400).json({
          success: false,
          message: 'ไม่พบบริการที่เลือก (Invalid service_id)',
        });
        return;
      }
      selectedServicePrice = srvResult[0].price;
    }

    let finalPrice: number | null = existing.final_price;
    let completedAt: Date | null = existing.completed_at;

    let promoCode = existing.promo_code;
    let discountPercent = existing.discount_percent || 0;

    if (input.promo_code !== undefined) {
      const rawPromo = input.promo_code?.trim().toUpperCase();
      if (rawPromo === 'HALLOWEEN20' || rawPromo === 'PROMO20' || rawPromo === 'FIX20') {
        promoCode = 'HALLOWEEN20';
        discountPercent = 20;
      } else if (!rawPromo) {
        promoCode = null;
        discountPercent = 0;
      }
    }

    if (targetRepairStatus === 'completed') {
      if (existing.repair_status !== 'completed' || finalPrice === null) {
        if (selectedServicePrice !== null) {
          finalPrice = Math.round(selectedServicePrice * (1 - discountPercent / 100));
        } else {
          finalPrice = null;
        }
      }
      if (existing.repair_status !== 'completed' || !completedAt) {
        completedAt = new Date();
      }
    }

    const [updated] = await db
      .update(inboxMessages)
      .set({
        comment: input.comment !== undefined ? input.comment : existing.comment,
        service_id: targetServiceId,
        repair_status: targetRepairStatus,
        technician_id: targetTechnicianId,
        promo_code: promoCode,
        discount_percent: discountPercent,
        final_price: finalPrice,
        completed_at: completedAt,
        is_read: true,
      })
      .where(eq(inboxMessages.cm_id, id))
      .returning();

    res.json({
      success: true,
      message:
        targetRepairStatus === 'completed'
          ? 'ส่งมอบงานซ่อมเรียบร้อยแล้ว'
          : targetRepairStatus === 'in_progress'
          ? 'อัปเดตสถานะเป็นกำลังดำเนินการซ่อมเรียบร้อยแล้ว'
          : 'บันทึกข้อมูลงานซ่อมเรียบร้อยแล้ว',
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
 * ลบข้อความแจ้งซ่อม (เฉพาะ Admin — และห้ามลบรายการที่ส่งมอบงานแล้ว)
 */
export async function deleteInboxMessage(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'รหัสข้อความไม่ถูกต้อง' });
      return;
    }

    const [existing] = await db
      .select()
      .from(inboxMessages)
      .where(eq(inboxMessages.cm_id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ success: false, message: 'ไม่พบข้อความแจ้งซ่อมที่ต้องการลบ' });
      return;
    }

    if (existing.repair_status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบรายการที่ส่งมอบงานเสร็จสิ้นแล้วได้ เพื่อรักษาความถูกต้องของประวัติการซ่อม',
      });
      return;
    }

    await db.delete(inboxMessages).where(eq(inboxMessages.cm_id, id));

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
