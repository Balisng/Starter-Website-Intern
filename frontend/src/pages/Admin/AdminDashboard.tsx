import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../../api/client';

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/dashboard');
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        setError(res.message || 'ไม่สามารถดึงข้อมูลสถิติได้');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">กำลังคำนวณสถิติและรายรับของศูนย์ซ่อม...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-100">ไม่สามารถโหลดข้อมูลแดชบอร์ดได้</h3>
        <p className="text-xs text-rose-400">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const { summary, categoryStats, recentActivities } = dashboardData;

  return (
    <div className="space-y-8 text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-950/70 border border-sky-800/50 text-sky-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dashboard สรุปภาพรวมศูนย์ซ่อม
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ข้อมูลรายรับและสถิตินับอัตโนมัติจากรายการซ่อมเสร็จและช่างในระบบ
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. REVENUE CARDS (Dark Mode) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รายรับรวมทั้งหมด</span>
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-['Plus_Jakarta_Sans'] tracking-tight">
            ฿{summary.totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            คำนวณจากงานซ่อมสถานะ <strong className="text-emerald-400">ซ่อมเสร็จแล้ว</strong>
          </p>
        </div>

        {/* Weekly Revenue */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รายรับรอบสัปดาห์</span>
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 font-['Plus_Jakarta_Sans'] tracking-tight">
            ฿{summary.weeklyRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ยอดรายรับ 7 วันย้อนหลัง
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รายรับรอบเดือน</span>
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center">
              <Calendar className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-3xl font-black text-sky-400 font-['Plus_Jakarta_Sans'] tracking-tight">
            ฿{summary.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ยอดรายรับ 30 วันย้อนหลัง
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. STAT COUNTERS (Dark Mode) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Customer Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">จำนวนลูกค้า</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {summary.completedRepairsCount} <span className="text-xs font-normal text-slate-400">คน</span>
          </p>
          <p className="text-[10px] text-slate-500">จากงานซ่อมที่สำเร็จแล้ว</p>
        </div>

        {/* Technician Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">จำนวนช่าง</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {summary.techniciansCount} <span className="text-xs font-normal text-slate-400">คน</span>
          </p>
          <p className="text-[10px] text-slate-500">Role เป็นช่างในระบบ</p>
        </div>

        {/* Pending Repairs Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">สินค้าที่รอซ่อม</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-['Plus_Jakarta_Sans']">
            {summary.pendingRepairsCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-500">สถานะรอซ่อม (Pending)</p>
        </div>

        {/* Completed Repairs Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">สินค้าที่ซ่อมแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
            {summary.completedRepairsCount} <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-500">สถานะซ่อมเสร็จ (Completed)</p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. CATEGORY BREAKDOWN & RECENT JOBS TABLE */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>สถิติรายรับตามหมวดหมู่</span>
          </h3>

          {categoryStats && categoryStats.length > 0 ? (
            <div className="space-y-2.5">
              {categoryStats.map((cat: any, i: number) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{cat.category_name}</span>
                    <span className="font-mono font-bold text-rose-400">฿{cat.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>งานที่ซ่อมสำเร็จ:</span>
                    <span className="font-medium text-slate-300">{cat.count} รายการ</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center font-normal">
              ยังไม่มีข้อมูลงานซ่อมที่เสร็จสมบูรณ์
            </p>
          )}
        </div>

        {/* Recent Activities Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              รายการแจ้งซ่อมล่าสุด
            </h3>
            <Link
              to="/admin/inbox"
              className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
            >
              <span>ไปที่ Inbox ทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">รหัส</th>
                  <th className="pb-3 font-semibold">ลูกค้า</th>
                  <th className="pb-3 font-semibold">บริการ</th>
                  <th className="pb-3 font-semibold">ราคา</th>
                  <th className="pb-3 font-semibold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((job: any) => (
                    <tr key={job.cm_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-400">#{job.cm_id}</td>
                      <td className="py-3 font-medium text-slate-200">{job.cm_username}</td>
                      <td className="py-3 text-slate-300">{job.service_name}</td>
                      <td className="py-3 font-bold text-white font-mono">฿{job.price.toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            job.repair_status === 'completed'
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                          }`}
                        >
                          {job.repair_status === 'completed' ? 'ซ่อมเสร็จแล้ว' : 'รอซ่อม'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 font-normal">
                      ยังไม่มีรายการแจ้งซ่อมในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
