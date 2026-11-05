import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { Request, Response } from 'express';
import { db } from '../config/db';
import { categories, inboxMessages, services, users } from '../db/schema';

/**
 * GET /api/dashboard
 * ดึงข้อมูลสถิติภาพรวมสำหรับหน้า Admin Dashboard
 * รองรับ Query: ?period=all | weekly | monthly
 * รันทุก Query แบบขนานด้วย Promise.all เพื่อความเร็วสูงสุดบน Serverless (Vercel + Neon)
 */
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const period = (req.query.period as string) || 'all'; // 'all' | 'weekly' | 'monthly'
    const now = new Date();

    // วันที่เริ่มต้นสำหรับ 7 วันย้อนหลัง (Weekly)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // วันที่เริ่มต้นสำหรับ 30 วันย้อนหลัง (Monthly)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let startDate: Date | null = null;
    if (period === 'weekly') {
      startDate = sevenDaysAgo;
    } else if (period === 'monthly') {
      startDate = thirtyDaysAgo;
    }

    const categoryConditions = [eq(inboxMessages.repair_status, 'completed')];
    if (startDate) {
      categoryConditions.push(
        sql`coalesce(${inboxMessages.completed_at}, ${inboxMessages.created_at}) >= ${startDate.toISOString()}`
      );
    }

    const categoryNameExpr = sql<string>`coalesce(${categories.cg_name}, 'อื่นๆ / บริการที่ยกเลิก')`;

    // รันทั้ง 6 Queries พร้อมกันในครั้งเดียว (Parallel Execution) เพื่อลด Latency บน Vercel
    const [
      completedItems,
      activeItems,
      techniciansCountResult,
      categoryStats,
      recentActivities,
      techniciansList,
      assignedJobs,
    ] = await Promise.all([
      // 1. รายการที่ซ่อมเสร็จแล้ว (repair_status = 'completed')
      db
        .select({
          cm_id: inboxMessages.cm_id,
          price: sql<number>`coalesce(${inboxMessages.final_price}, ${services.price}, 0)::int`,
          completed_at: inboxMessages.completed_at,
          created_at: inboxMessages.created_at,
          technician_id: inboxMessages.technician_id,
        })
        .from(inboxMessages)
        .leftJoin(services, eq(inboxMessages.service_id, services.id))
        .where(eq(inboxMessages.repair_status, 'completed')),

      // 2. รายการที่อยู่ในคิวซ่อม (ทั้ง pending และ in_progress)
      db
        .select({
          cm_id: inboxMessages.cm_id,
          created_at: inboxMessages.created_at,
          technician_id: inboxMessages.technician_id,
          repair_status: inboxMessages.repair_status,
        })
        .from(inboxMessages)
        .where(ne(inboxMessages.repair_status, 'completed')),

      // 3. จำนวนช่าง (Role = 'technician')
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(eq(users.role, 'technician')),

      // 4. ข้อมูลจำแนกตามหมวดหมู่สินค้า
      db
        .select({
          category_name: categoryNameExpr,
          count: sql<number>`count(${inboxMessages.cm_id})::int`,
          revenue: sql<number>`coalesce(sum(coalesce(${inboxMessages.final_price}, ${services.price}, 0)), 0)::int`,
        })
        .from(inboxMessages)
        .leftJoin(services, eq(inboxMessages.service_id, services.id))
        .leftJoin(categories, eq(services.cg_id, categories.cg_id))
        .where(and(...categoryConditions))
        .groupBy(categories.cg_name),

      // 5. รายการล่าสุด 6 รายการสำหรับแสดงในตาราง Recent Activities พร้อมชื่อช่าง
      db
        .select({
          cm_id: inboxMessages.cm_id,
          cm_username: inboxMessages.cm_username,
          service_name: sql<string>`coalesce(${services.name}, 'ปรึกษาช่าง / ประเมินภายหลัง')`,
          price: sql<number>`coalesce(${inboxMessages.final_price}, ${services.price}, 0)::int`,
          repair_status: inboxMessages.repair_status,
          technician_name: users.u_name,
          technician_surname: users.u_surname,
          created_at: inboxMessages.created_at,
          completed_at: inboxMessages.completed_at,
        })
        .from(inboxMessages)
        .leftJoin(services, eq(inboxMessages.service_id, services.id))
        .leftJoin(users, eq(inboxMessages.technician_id, users.u_id))
        .orderBy(desc(inboxMessages.created_at))
        .limit(6),

      // 6. รายชื่อช่างทั้งหมด
      db
        .select({
          u_id: users.u_id,
          u_name: users.u_name,
          u_surname: users.u_surname,
          username: users.username,
          cel: users.cel,
          email: users.email,
        })
        .from(users)
        .where(eq(users.role, 'technician'))
        .orderBy(users.u_name),

      // 7. งานทั้งหมดที่ผูกกับช่าง
      db
        .select({
          cm_id: inboxMessages.cm_id,
          technician_id: inboxMessages.technician_id,
          cm_username: inboxMessages.cm_username,
          cm_cel: inboxMessages.cm_cel,
          cm_symptom: inboxMessages.cm_symptom,
          service_id: inboxMessages.service_id,
          service_name: services.name,
          service_price: sql<number>`coalesce(${inboxMessages.final_price}, ${services.price}, 0)::int`,
          repair_status: inboxMessages.repair_status,
          created_at: inboxMessages.created_at,
          completed_at: inboxMessages.completed_at,
        })
        .from(inboxMessages)
        .leftJoin(services, eq(inboxMessages.service_id, services.id))
        .where(sql`${inboxMessages.technician_id} IS NOT NULL`)
        .orderBy(desc(inboxMessages.created_at)),
    ]);

    let totalRevenue = 0;
    let weeklyRevenue = 0;
    let monthlyRevenue = 0;
    let periodRevenue = 0;
    let periodCompletedCount = 0;

    for (const item of completedItems) {
      const price = item.price || 0;
      totalRevenue += price;

      const itemDate = new Date(item.completed_at || item.created_at);
      if (itemDate >= sevenDaysAgo) {
        weeklyRevenue += price;
      }
      if (itemDate >= thirtyDaysAgo) {
        monthlyRevenue += price;
      }

      if (!startDate || itemDate >= startDate) {
        periodRevenue += price;
        periodCompletedCount++;
      }
    }

    let periodPendingCount = 0;
    for (const item of activeItems) {
      const itemDate = new Date(item.created_at);
      if (!startDate || itemDate >= startDate) {
        periodPendingCount++;
      }
    }

    const techniciansCount = techniciansCountResult[0]?.count || 0;

    const technicianPerformance = techniciansList.map((tech) => {
      const techJobs = assignedJobs.filter((j) => j.technician_id === tech.u_id);
      const pendingJobs = techJobs.filter((j) => j.repair_status !== 'completed');
      const completedJobs = techJobs.filter((j) => j.repair_status === 'completed');
      const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.service_price || 0), 0);

      return {
        ...tech,
        pendingCount: pendingJobs.length,
        completedCount: completedJobs.length,
        totalJobsCount: techJobs.length,
        totalRevenue,
        jobs: techJobs,
      };
    });

    res.json({
      success: true,
      data: {
        period,
        summary: {
          totalRevenue,
          weeklyRevenue,
          monthlyRevenue,
          periodRevenue,
          periodCompletedCount,
          periodPendingCount,
          completedRepairsCount: completedItems.length,
          pendingRepairsCount: activeItems.length,
          techniciansCount,
        },
        categoryStats,
        recentActivities,
        technicianPerformance,
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
