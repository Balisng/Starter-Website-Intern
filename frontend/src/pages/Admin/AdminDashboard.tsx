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
    <div className="space-y-8 text-slate-100">
      
      {/* ======================================================== */}
      {/* TOP HEADER & PERIOD SWITCHER (Requirement 3) */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-950/70 border border-sky-800/50 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dashboard สรุปภาพรวมศูนย์ซ่อม
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ข้อมูลรายรับและสถิตินับอัตโนมัติจากรายการซ่อมเสร็จและช่างในระบบ คำนวณแบบ Real-time
          </p>
        </div>

        {/* Action Controls: Period Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Period Filter Pill Buttons */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-xs font-semibold shadow-inner">
            <button
              onClick={() => handlePeriodChange('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 'all'
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด (All-time)
            </button>
            <button
              onClick={() => handlePeriodChange('weekly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                period === 'weekly'
                  ? 'bg-rose-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>รายสัปดาห์ (7 วัน)</span>
            </button>
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                period === 'monthly'
                  ? 'bg-sky-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>รายเดือน (30 วัน)</span>
            </button>
          </div>

          <button
            onClick={() => fetchStats(period)}
            title="รีเฟรชสถิติ"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. REVENUE CARDS (Reflects Period Dynamically) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Dynamic Period Revenue Card (Primary Highlight) */}
        <div className={`p-6 rounded-3xl border shadow-sm space-y-2 relative overflow-hidden transition-all ${
          period === 'weekly'
            ? 'bg-gradient-to-br from-slate-900 to-rose-950/30 border-rose-800/60 ring-1 ring-rose-500/20'
            : period === 'monthly'
            ? 'bg-gradient-to-br from-slate-900 to-sky-950/30 border-sky-800/60 ring-1 ring-sky-500/20'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {period === 'weekly'
                ? 'รายรับตามช่วงเวลา (รอบ 7 วัน)'
                : period === 'monthly'
                ? 'รายรับตามช่วงเวลา (รอบ 30 วัน)'
                : 'รายรับรวมทั้งหมด'}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              period === 'weekly'
                ? 'bg-rose-950/80 border border-rose-800/60 text-rose-400'
                : 'bg-sky-950/80 border border-sky-800/60 text-sky-400'
            }`}>
              <DollarSign className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className={`text-3xl font-black font-['Plus_Jakarta_Sans'] tracking-tight ${
            period === 'weekly' ? 'text-rose-400' : period === 'monthly' ? 'text-sky-400' : 'text-white'
          }`}>
            ฿{summary.periodRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>
              {period === 'weekly'
                ? 'คำนวณจากงานซ่อมเสร็จใน 7 วันล่าสุด'
                : period === 'monthly'
                ? 'คำนวณจากงานซ่อมเสร็จใน 30 วันล่าสุด'
                : 'คำนวณจากงานซ่อมเสร็จทั้งหมด'}
            </span>
          </div>
        </div>

        {/* Weekly Revenue Card (Benchmark) */}
        <div className={`p-6 rounded-3xl bg-slate-900 border shadow-sm space-y-2 relative overflow-hidden transition-all ${
          period === 'weekly' ? 'border-rose-500/60' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รายรับรอบสัปดาห์ (7 วัน)</span>
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

        {/* Monthly Revenue Card (Benchmark) */}
        <div className={`p-6 rounded-3xl bg-slate-900 border shadow-sm space-y-2 relative overflow-hidden transition-all ${
          period === 'monthly' ? 'border-sky-500/60' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รายรับรอบเดือน (30 วัน)</span>
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
      {/* 2. STAT COUNTERS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Customer Count / Completed in Period */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">ลูกค้าที่ซ่อมเสร็จ</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {period === 'all' ? summary.completedRepairsCount : summary.periodCompletedCount}{' '}
            <span className="text-xs font-normal text-slate-400">คน</span>
          </p>
          <p className="text-[10px] text-slate-500">
            {period === 'all' ? 'งานซ่อมเสร็จทั้งหมด' : `ช่วงเวลาที่เลือก (${period === 'weekly' ? '7 วัน' : '30 วัน'})`}
          </p>
        </div>

        {/* Technician Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">จำนวนช่างในระบบ</span>
            <Wrench className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {summary.techniciansCount} <span className="text-xs font-normal text-slate-400">คน</span>
          </p>
          <p className="text-[10px] text-slate-500">พร้อมรับและดำเนินการซ่อม</p>
        </div>

        {/* Pending Repairs Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">สินค้าที่รอซ่อม</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 font-['Plus_Jakarta_Sans']">
            {period === 'all' ? summary.pendingRepairsCount : summary.periodPendingCount}{' '}
            <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-500">
            {period === 'all' ? 'งานรอซ่อมทั้งหมด' : `งานใหม่ในช่วง ${period === 'weekly' ? '7 วัน' : '30 วัน'}`}
          </p>
        </div>

        {/* Completed Repairs Count */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold">สินค้าที่ซ่อมแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
            {period === 'all' ? summary.completedRepairsCount : summary.periodCompletedCount}{' '}
            <span className="text-xs font-normal text-slate-400">เครื่อง</span>
          </p>
          <p className="text-[10px] text-slate-500">
            {period === 'all' ? 'งานซ่อมเสร็จทั้งหมด' : `สำเร็จใน ${period === 'weekly' ? '7 วัน' : '30 วัน'}`}
          </p>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 3. CATEGORY BREAKDOWN & RECENT JOBS TABLE */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Breakdown (Dynamically filtered by period) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>สถิติรายรับตามหมวดหมู่</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">
              {period === 'weekly' ? '7 วัน' : period === 'monthly' ? '30 วัน' : 'ทั้งหมด'}
            </span>
          </div>

          {categoryStats && categoryStats.length > 0 ? (
            <div className="space-y-2.5">
              {categoryStats.map((cat, i) => (
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
              ยังไม่มีข้อมูลงานซ่อมที่เสร็จสมบูรณ์ในช่วงเวลานี้
            </p>
          )}
        </div>

        {/* Recent Activities Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              รายการแจ้งซ่อมล่าสุด (Recent Activities)
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
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">รหัส</th>
                  <th className="pb-3 font-semibold">ลูกค้า</th>
                  <th className="pb-3 font-semibold">บริการ</th>
                  <th className="pb-3 font-semibold">ช่างผู้รับผิดชอบ</th>
                  <th className="pb-3 font-semibold">ราคา</th>
                  <th className="pb-3 font-semibold">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.map((job) => (
                    <tr key={job.cm_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-400">#{job.cm_id}</td>
                      <td className="py-3 font-medium text-slate-200">{job.cm_username}</td>
                      <td className="py-3 text-slate-300">{job.service_name}</td>
                      <td className="py-3">
                        {job.technician_name ? (
                          <span className="font-medium text-sky-400">
                            ช่าง {job.technician_name} {job.technician_surname || ''}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">ยังไม่มีช่าง</span>
                        )}
                      </td>
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
      {/* 4. TECHNICIAN PERFORMANCE & WORKLOAD (Requirement 4.3) */}
      {/* ======================================================== */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-400">
                <Wrench className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                สถิติและผลการปฏิบัติงานของช่างแต่ละคน (Technician Performance)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ติดตามปริมาณงานที่กำลังรับผิดชอบ (Pending), งานที่ซ่อมสำเร็จ (Completed), ยอดรายรับรวม และดูประวัติการซ่อมของช่างแต่ละคน
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            ช่างทั้งหมด: <strong className="text-white">{technicianPerformance?.length || 0}</strong> คน
          </div>
        </div>

        {technicianPerformance && technicianPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {technicianPerformance.map((tech) => (
              <div
                key={tech.u_id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                
                {/* Tech Info Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center font-black text-sm shrink-0">
                      {tech.u_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        ช่าง {tech.u_name} {tech.u_surname}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">@{tech.username}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/50">
                    ช่างเทคนิค
                  </span>
                </div>

                {/* Contact info */}
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <PhoneCall className="w-3 h-3 text-rose-400" />
                    <span className="font-mono text-slate-300">{tech.cel}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-sky-400" />
                    <span className="truncate text-slate-300">{tech.email}</span>
                  </p>
                </div>

                {/* Performance Numbers Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                  
                  {/* Pending Jobs */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>รอซ่อม</span>
                    </div>
                    <p className="text-lg font-black text-amber-400 font-['Plus_Jakarta_Sans']">
                      {tech.pendingCount}
                    </p>
                    <span className="text-[9px] text-slate-500">งาน</span>
                  </div>

                  {/* Completed Jobs */}
                  <div className="space-y-0.5 border-x border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>เสร็จแล้ว</span>
                    </div>
                    <p className="text-lg font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
                      {tech.completedCount}
                    </p>
                    <span className="text-[9px] text-slate-500">งาน</span>
                  </div>

                  {/* Total Revenue */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-rose-400 font-medium">
                      <DollarSign className="w-3 h-3" />
                      <span>ยอดซ่อม</span>
                    </div>
                    <p className="text-base font-black text-rose-400 font-mono truncate px-1">
                      ฿{tech.totalRevenue >= 1000 ? `${(tech.totalRevenue / 1000).toFixed(1)}k` : tech.totalRevenue}
                    </p>
                    <span className="text-[9px] text-slate-500">บาท</span>
                  </div>

                </div>

                {/* View Job History Button */}
                <button
                  onClick={() => setSelectedTech(tech)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>ดูประวัติงานซ่อม ({tech.totalJobsCount} งาน)</span>
                </button>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500 font-normal">
            ยังไม่มีผู้ใช้งานที่มี Role เป็นช่าง (technician) ในระบบ สามารถเพิ่มช่างได้ที่หน้าจัดการผู้ใช้
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 5. MODAL: TECHNICIAN JOB HISTORY MODAL (Requirement 4.3.5) */}
      {/* ======================================================== */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl p-6 sm:p-7 space-y-5 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60">
                    <UserCheck className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-white">
                    ประวัติงานซ่อม: ช่าง {selectedTech.u_name} {selectedTech.u_surname}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-3">
                  <span>เบอร์ติดต่อ: <strong className="text-slate-300 font-mono">{selectedTech.cel}</strong></span>
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
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">งานที่กำลังรับผิดชอบ</span>
                <p className="text-lg font-black text-amber-400 font-['Plus_Jakarta_Sans']">
                  {selectedTech.pendingCount} <span className="text-xs font-normal text-slate-400">งาน</span>
                </p>
              </div>
              <div className="text-center border-x border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">ซ่อมสำเร็จเรียบร้อย</span>
                <p className="text-lg font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
                  {selectedTech.completedCount} <span className="text-xs font-normal text-slate-400">งาน</span>
                </p>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold">รายรับรวมที่สร้างได้</span>
                <p className="text-lg font-black text-rose-400 font-mono">
                  ฿{selectedTech.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Assigned Jobs List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                <span>รายการงานซ่อมที่ได้รับมอบหมาย ({selectedTech.jobs.length} รายการ):</span>
              </h4>

              {selectedTech.jobs && selectedTech.jobs.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3.5 font-semibold">Ticket</th>
                        <th className="py-2.5 px-3.5 font-semibold">ลูกค้า & เบอร์ติดต่อ</th>
                        <th className="py-2.5 px-3.5 font-semibold">บริการที่ซ่อม</th>
                        <th className="py-2.5 px-3.5 font-semibold">อาการเสีย</th>
                        <th className="py-2.5 px-3.5 font-semibold">ราคา</th>
                        <th className="py-2.5 px-3.5 font-semibold">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {selectedTech.jobs.map((job) => (
                        <tr key={job.cm_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-300">
                            #{job.cm_id}
                          </td>
                          <td className="py-3 px-3.5">
                            <p className="font-bold text-white">{job.cm_username}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{job.cm_cel}</p>
                          </td>
                          <td className="py-3 px-3.5">
                            <p className="font-medium text-slate-200">
                              {job.service_name || 'ไม่แน่ใจอาการ (รอประเมิน)'}
                            </p>
                          </td>
                          <td className="py-3 px-3.5 max-w-xs">
                            <p className="text-slate-400 line-clamp-1">{job.cm_symptom}</p>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-rose-400 font-mono">
                            ฿{job.service_price ? job.service_price.toLocaleString() : 0}
                          </td>
                          <td className="py-3 px-3.5">
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
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                  ช่างท่านนี้ยังไม่ได้รับมอบหมายงานซ่อมในระบบ
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <Link
                to="/admin/inbox"
                onClick={() => setSelectedTech(null)}
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
              >
                <span>ไปที่หน้ากล่องข้อความ Inbox เพื่อจัดการงาน</span>
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
