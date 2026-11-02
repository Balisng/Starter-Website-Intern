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
  Wrench,
  PhoneCall,
  Mail,
  Eye,
  X,
  ExternalLink,
  Briefcase,
  UserCheck,
  History,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import type { DashboardData, TechnicianPerformance } from '../../types';

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedTech, setSelectedTech] = useState<TechnicianPerformance | null>(null);

  const fetchStats = async (selectedPeriod: 'all' | 'weekly' | 'monthly' = period) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<DashboardData>('/dashboard', {
        params: { period: selectedPeriod },
      });
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
    fetchStats(period);
  }, []);

  const handlePeriodChange = (newPeriod: 'all' | 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
    fetchStats(newPeriod);
  };

  if (loading && !dashboardData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">กำลังคำนวณสถิติและรายรับของศูนย์ซ่อม...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-rose-900/50 text-center space-y-3">
        <AlertCircle className="w-9 h-9 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-100">ไม่สามารถโหลดข้อมูลแดชบอร์ดได้</h3>
        <p className="text-xs text-rose-400">{error}</p>
        <button
          onClick={() => fetchStats(period)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  const { summary, categoryStats, recentActivities, technicianPerformance } = dashboardData;

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* ======================================================== */}
      {/* TOP HEADER & PERIOD SWITCHER */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-950/70 border border-sky-800/50 text-sky-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Dashboard สรุปภาพรวมศูนย์ซ่อม
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            รายรับคำนวณจากยอดบิลที่ส่งมอบงานอย่างถาวร (Permanent Billed Revenue) ไม่สูญหาย
          </p>
        </div>

        {/* Action Controls: Period Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Period Filter Pill Buttons */}
          <div className="flex flex-wrap items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs font-semibold">
            <button
              onClick={() => handlePeriodChange('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'all'
                  ? 'bg-sky-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => handlePeriodChange('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                period === 'weekly'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>7 วัน</span>
            </button>
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                period === 'monthly'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>30 วัน</span>
            </button>
          </div>

          <button
            onClick={() => fetchStats(period)}
            title="รีเฟรชสถิติ"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. REVENUE CARDS (Positive Emerald / Sky / Indigo Palette) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Dynamic Period Revenue Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-800/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              {period === 'weekly'
                ? 'รายรับตามช่วงเวลา (7 วัน)'
                : period === 'monthly'
                ? 'รายรับตามช่วงเวลา (30 วัน)'
                : 'รายรับรวมในบัญชีทั้งหมด'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-['Plus_Jakarta_Sans'] tracking-tight">
            ฿{summary.periodRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
            <span className="truncate">
              {period === 'weekly'
                ? 'ยอดปิดบิลถาวรใน 7 วันล่าสุด'
                : period === 'monthly'
                ? 'ยอดปิดบิลถาวรใน 30 วันล่าสุด'
                : 'ยอดปิดบิลถาวรสะสมทั้งหมด'}
            </span>
          </div>
        </div>

        {/* Weekly Revenue Card */}
        <div className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border space-y-1.5 transition-all ${
          period === 'weekly' ? 'border-sky-500/60' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">รายรับรอบสัปดาห์ (7 วัน)</span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-400 font-['Plus_Jakarta_Sans'] tracking-tight">
            ฿{summary.weeklyRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ยอดรายรับ 7 วันย้อนหลัง
          </p>
        </div>

        {/* Monthly Revenue Card */}
        <div className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border space-y-1.5 transition-all ${
          period === 'monthly' ? 'border-indigo-500/60' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">รายรับรอบเดือน (30 วัน)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-400 font-['Plus_Jakarta_Sans'] tracking-tight">
            ฿{summary.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            ยอดรายรับ 30 วันย้อนหลัง
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. STAT COUNTERS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Customer Count / Completed in Period */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">ลูกค้าที่ซ่อมเสร็จ</span>
            <Users className="w-4 h-4 text-sky-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {period === 'all' ? summary.completedRepairsCount : summary.periodCompletedCount}{' '}
            <span className="text-xs font-normal text-slate-400">ราย</span>
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {period === 'all' ? 'ส่งมอบสำเร็จทั้งหมด' : `ในช่วง ${period === 'weekly' ? '7 วัน' : '30 วัน'}`}
          </p>
        </div>

        {/* Technician Count */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">จำนวนช่างในระบบ</span>
            <Wrench className="w-4 h-4 text-indigo-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {summary.techniciansCount} <span className="text-xs font-normal text-slate-400">คน</span>
          </p>
          <p className="text-[10px] text-slate-500 truncate">พร้อมรับและดำเนินการซ่อม</p>
        </div>

        {/* Pending Repairs Count */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">คิวสินค้าที่รอซ่อม</span>
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400 font-['Plus_Jakarta_Sans']">
            {period === 'all' ? summary.pendingRepairsCount : summary.periodPendingCount}{' '}
            <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {period === 'all' ? 'คิวรอซ่อมปัจจุบัน' : `รับเข้าใหม่ใน ${period === 'weekly' ? '7 วัน' : '30 วัน'}`}
          </p>
        </div>

        {/* Completed Repairs Count */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold">ซ่อมและคิดเงินแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
            {period === 'all' ? summary.completedRepairsCount : summary.periodCompletedCount}{' '}
            <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {period === 'all' ? 'ปิดงานถาวรทั้งหมด' : `สำเร็จใน ${period === 'weekly' ? '7 วัน' : '30 วัน'}`}
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. CATEGORY BREAKDOWN & RECENT JOBS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Category Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>รายรับตามหมวดหมู่</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
              {period === 'weekly' ? '7 วัน' : period === 'monthly' ? '30 วัน' : 'ทั้งหมด'}
            </span>
          </div>

          {categoryStats && categoryStats.length > 0 ? (
            <div className="space-y-2.5">
              {categoryStats.map((cat, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{cat.category_name}</span>
                    <span className="font-mono font-bold text-emerald-400">฿{cat.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ส่งมอบสำเร็จ:</span>
                    <span className="font-medium text-slate-300">{cat.count} รายการ</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center font-normal">
              ยังไม่มีข้อมูลงานซ่อมที่เสร็จสมบูรณ์ในช่วงเวลานี้
            </p>
          )}
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              รายการเคลื่อนไหวล่าสุด (Recent Activities)
            </h3>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/inbox"
                className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
              >
                <span>คิวงานซ่อม</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/admin/history"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <History className="w-3.5 h-3.5" />
                <span>ประวัติการซ่อม</span>
              </Link>
            </div>
          </div>

          {/* Mobile Card List (md:hidden) */}
          <div className="md:hidden space-y-2.5">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((job) => (
                <div key={job.cm_id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-400">#{job.cm_id} • {job.cm_username}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        job.repair_status === 'completed'
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      {job.repair_status === 'completed' ? 'ซ่อมเสร็จแล้ว' : 'รอซ่อม'}
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium truncate">{job.service_name}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="text-sky-400">
                      {job.technician_name ? `ช่าง ${job.technician_name}` : 'ยังไม่ระบุช่าง'}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">฿{job.price.toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">ยังไม่มีรายการแจ้งซ่อมในระบบ</p>
            )}
          </div>

          {/* Desktop Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">รหัส</th>
                  <th className="pb-2.5 font-semibold">ลูกค้า</th>
                  <th className="pb-2.5 font-semibold">บริการ</th>
                  <th className="pb-2.5 font-semibold">ช่างผู้รับผิดชอบ</th>
                  <th className="pb-2.5 font-semibold">ยอดเงิน</th>
                  <th className="pb-2.5 font-semibold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((job) => (
                    <tr key={job.cm_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-slate-400">#{job.cm_id}</td>
                      <td className="py-2.5 font-medium text-slate-200">{job.cm_username}</td>
                      <td className="py-2.5 text-slate-300 max-w-[180px] truncate">{job.service_name}</td>
                      <td className="py-2.5">
                        {job.technician_name ? (
                          <span className="font-medium text-sky-400">
                            ช่าง {job.technician_name} {job.technician_surname || ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">ยังไม่มีช่าง</span>
                        )}
                      </td>
                      <td className="py-2.5 font-bold text-emerald-400 font-mono">฿{job.price.toLocaleString()}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <td colSpan={6} className="py-6 text-center text-slate-500 font-normal">
                      ยังไม่มีรายการแจ้งซ่อมในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. TECHNICIAN PERFORMANCE & WORKLOAD */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-400">
                <Wrench className="w-4 h-4" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                สถิติและผลงานของช่างแต่ละคน (Technician Performance)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ตรวจสอบงานที่ถืออยู่ งานที่ส่งมอบเสร็จแล้ว และยอดรายรับที่ช่างแต่ละคนทำได้ เพื่อความโปร่งใสและป้องกันการอู้งาน
            </p>
          </div>

          <Link
            to="/admin/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <History className="w-3.5 h-3.5" />
            <span>ดูหน้าประวัติการซ่อมแบบละเอียด</span>
          </Link>
        </div>

        {technicianPerformance && technicianPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {technicianPerformance.map((tech) => (
              <div
                key={tech.u_id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3.5"
              >
                
                {/* Tech Info Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center font-black text-sm shrink-0">
                      {tech.u_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">
                        ช่าง {tech.u_name} {tech.u_surname}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono truncate">@{tech.username}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/50 shrink-0">
                    ช่างเทคนิค
                  </span>
                </div>

                {/* Contact info */}
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="font-mono text-slate-300">{tech.cel}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-sky-400 shrink-0" />
                    <span className="truncate text-slate-300">{tech.email}</span>
                  </p>
                </div>

                {/* Performance Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                  
                  {/* Pending Jobs */}
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>กำลังซ่อม</span>
                    </div>
                    <p className="text-base font-black text-amber-400 font-['Plus_Jakarta_Sans']">
                      {tech.pendingCount}
                    </p>
                    <span className="text-[9px] text-slate-500">งาน</span>
                  </div>

                  {/* Completed Jobs */}
                  <div className="border-x border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>เสร็จแล้ว</span>
                    </div>
                    <p className="text-base font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
                      {tech.completedCount}
                    </p>
                    <span className="text-[9px] text-slate-500">งาน</span>
                  </div>

                  {/* Total Revenue */}
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <DollarSign className="w-3 h-3" />
                      <span>ยอดซ่อม</span>
                    </div>
                    <p className="text-sm font-black text-emerald-400 font-mono truncate px-1">
                      ฿{tech.totalRevenue >= 1000 ? `${(tech.totalRevenue / 1000).toFixed(1)}k` : tech.totalRevenue}
                    </p>
                    <span className="text-[9px] text-slate-500">บาท</span>
                  </div>

                </div>

                {/* View Job History Button */}
                <button
                  onClick={() => setSelectedTech(tech)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>ดูประวัติงานซ่อม ({tech.totalJobsCount} งาน)</span>
                </button>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-500 font-normal">
            ยังไม่มีผู้ใช้งานที่มี Role เป็นช่าง (technician) ในระบบ
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: TECHNICIAN JOB HISTORY MODAL */}
      {/* ======================================================== */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl w-full max-w-3xl p-4 sm:p-6 space-y-4 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    ประวัติงานซ่อม: ช่าง {selectedTech.u_name} {selectedTech.u_surname}
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>เบอร์: <strong className="text-slate-300 font-mono">{selectedTech.cel}</strong></span>
                  <span>อีเมล: <strong className="text-slate-300">{selectedTech.email}</strong></span>
                </p>
              </div>

              <button
                onClick={() => setSelectedTech(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">กำลังซ่อม</span>
                <p className="text-base sm:text-lg font-black text-amber-400 font-['Plus_Jakarta_Sans']">
                  {selectedTech.pendingCount} <span className="text-[11px] font-normal text-slate-400">งาน</span>
                </p>
              </div>
              <div className="text-center border-x border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">ซ่อมเสร็จแล้ว</span>
                <p className="text-base sm:text-lg font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
                  {selectedTech.completedCount} <span className="text-[11px] font-normal text-slate-400">งาน</span>
                </p>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">รายรับรวม</span>
                <p className="text-sm sm:text-lg font-black text-emerald-400 font-mono">
                  ฿{selectedTech.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Assigned Jobs List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                <span>รายการงานซ่อมที่รับผิดชอบ ({selectedTech.jobs.length} รายการ):</span>
              </h4>

              {selectedTech.jobs && selectedTech.jobs.length > 0 ? (
                <>
                  {/* Mobile View inside Modal */}
                  <div className="sm:hidden space-y-2">
                    {selectedTech.jobs.map((job) => (
                      <div key={job.cm_id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-300">#{job.cm_id} • {job.cm_username}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              job.repair_status === 'completed'
                                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                                : 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                            }`}
                          >
                            {job.repair_status === 'completed' ? 'ซ่อมเสร็จแล้ว' : 'รอซ่อม'}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium">{job.service_name || 'รอประเมิน'}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="truncate max-w-[180px]">{job.cm_symptom}</span>
                          <span className="font-mono font-bold text-emerald-400">
                            ฿{job.service_price ? job.service_price.toLocaleString() : 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table inside Modal */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold">รหัส</th>
                          <th className="py-2.5 px-3 font-semibold">ลูกค้า</th>
                          <th className="py-2.5 px-3 font-semibold">บริการที่ซ่อม</th>
                          <th className="py-2.5 px-3 font-semibold">อาการเสีย</th>
                          <th className="py-2.5 px-3 font-semibold">ยอดเงิน</th>
                          <th className="py-2.5 px-3 font-semibold">สถานะ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                        {selectedTech.jobs.map((job) => (
                          <tr key={job.cm_id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                              #{job.cm_id}
                            </td>
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-white">{job.cm_username}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{job.cm_cel}</p>
                            </td>
                            <td className="py-2.5 px-3">
                              <p className="font-medium text-slate-200">
                                {job.service_name || 'ไม่แน่ใจอาการ (รอประเมิน)'}
                              </p>
                            </td>
                            <td className="py-2.5 px-3 max-w-[180px]">
                              <p className="text-slate-400 line-clamp-1">{job.cm_symptom}</p>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">
                              ฿{job.service_price ? job.service_price.toLocaleString() : 0}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  job.repair_status === 'completed'
                                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                                    : 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                                }`}
                              >
                                {job.repair_status === 'completed' ? 'ซ่อมเสร็จแล้ว' : 'รอซ่อม'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  ช่างท่านนี้ยังไม่ได้รับมอบหมายงานซ่อมในระบบ
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <Link
                to="/admin/history"
                onClick={() => setSelectedTech(null)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
              >
                <span>ดูประวัติงานที่ซ่อมเสร็จทั้งหมด</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setSelectedTech(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
