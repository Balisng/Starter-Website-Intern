import { desc, eq, sql } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { categories, inboxMessages, services, users } from '../db/schema';

/**
 * GET /api/dashboard
 * ดึงข้อมูลสถิติภาพรวมสำหรับหน้า Admin Dashboard
 */
export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();

    // วันที่เริ่มต้นสำหรับ 7 วันย้อนหลัง (Weekly)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // วันที่เริ่มต้นสำหรับ 30 วันย้อนหลัง (Monthly)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. ดึงข้อมูลรายรับทั้งหมด รายสัปดาห์ และรายเดือน
    // เฉพาะรายการที่ repair_status = 'completed'
    const completedItems = await db
      .select({
        price: services.price,
        created_at: inboxMessages.created_at,
      })
      .from(inboxMessages)
      .innerJoin(services, eq(inboxMessages.service_id, services.id))
      .where(eq(inboxMessages.repair_status, 'completed'));

    let totalRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;

    for (const item of completedItems) {
      const price = item.price || 0;
      totalRevenue += price;

      const itemDate = new Date(item.created_at);
      if (itemDate >= sevenDaysAgo) {
        weeklyRevenue += price;
      }
      if (itemDate >= thirtyDaysAgo) {
        monthlyRevenue += price;
      }
    }

    // 2. จำนวนลูกค้าที่ซ่อมเสร็จแล้ว (นับจาก Inbox ที่สถานะเป็น 'completed')
    const completedRepairsCount = completedItems.length;

    // 3. จำนวนช่าง (Role = 'technician')
    const [techniciansCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'technician'));
    const techniciansCount = techniciansCountResult?.count || 0;

    // 4. จำนวนสินค้าที่รอซ่อม (Inbox ที่ repair_status = 'pending')
    const [pendingRepairsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inboxMessages)
      .where(eq(inboxMessages.repair_status, 'pending'));
    const pendingRepairsCount = pendingRepairsResult?.count || 0;

    // 5. รายการล่าสุด 5 รายการสำหรับแสดงในตาราง Recent Activities
    const recentActivities = await db
      .select({
        cm_id: inboxMessages.cm_id,
        cm_username: inboxMessages.cm_username,
        service_name: sql<string>`coalesce(${services.name}, 'ปรึกษาช่าง / ประเมินภายหลัง')`,
        price: sql<number>`coalesce(${services.price}, 0)::int`,
        repair_status: inboxMessages.repair_status,
        created_at: inboxMessages.created_at,
      })
      .from(inboxMessages)
      .leftJoin(services, eq(inboxMessages.service_id, services.id))
      .orderBy(desc(inboxMessages.created_at))
      .limit(5);

    // 6. ข้อมูลจำแนกตามหมวดหมู่สินค้า
    const categoryStats = await db
      .select({
        category_name: categories.cg_name,
        count: sql<number>`count(${inboxMessages.cm_id})::int`,
        revenue: sql<number>`coalesce(sum(${services.price}), 0)::int`,
      })
      .from(inboxMessages)
      .innerJoin(services, eq(inboxMessages.service_id, services.id))
      .innerJoin(categories, eq(services.cg_id, categories.cg_id))
      .where(eq(inboxMessages.repair_status, 'completed'))
      .groupBy(categories.cg_name);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          weeklyRevenue,
          monthlyRevenue,
          completedRepairsCount,
          pendingRepairsCount,
          techniciansCount,
        },
        categoryStats,
        recentActivities,
      },
    });
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการคำนวณสถิติ Dashboard',
    });
  }
}
