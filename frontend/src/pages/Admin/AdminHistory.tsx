import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Search,
  Wrench,
  Calendar,
  DollarSign,
  UserCheck,
  Clock,
  Eye,
  X,
  PhoneCall,
  Mail,
  FileCheck2,
  ShieldCheck,
  Filter,
  ZoomIn,
  ArrowLeft,
  Award,
  AlertTriangle,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useService } from '../../context/ServiceContext';
import type { Category, InboxMessage, User } from '../../types';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const AdminHistory: React.FC = () => {
  const { showToast } = useService();
  const [allMessages, setAllMessages] = useState<InboxMessage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [flashKey, setFlashKey] = useState<number>(0);

  // Filters
  const [selectedTechId, setSelectedTechId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'weekly' | 'monthly'>('all');
  const [search, setSearch] = useState<string>('');

  // Modal & Lightbox
  const [selectedReceipt, setSelectedReceipt] = useState<InboxMessage | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const fetchData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [msgRes, catRes, userRes] = await Promise.all([
        apiRequest<InboxMessage[]>('/inbox'),
        apiRequest<Category[]>('/categories'),
        apiRequest<User[]>('/users'),
      ]);

      if (msgRes.success && msgRes.data) {
        setAllMessages(msgRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (userRes.success && userRes.data) {
        setTechnicians(userRes.data.filter((u) => u.role === 'technician'));
      }
      if (isManualRefresh) {
        setFlashKey((prev) => prev + 1);
        showToast('รีเฟรชข้อมูลประวัติการซ่อมล่าสุดเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Error loading repair history:', err);
      if (isManualRefresh) {
        showToast('ไม่สามารถรีเฟรชข้อมูลได้', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  // เฉพาะรายการที่ส่งมอบงานเรียบร้อยแล้ว (completed)
  const completedMessages = useMemo(
    () =>
      allMessages
        .filter((m) => m.repair_status === 'completed')
        .sort((a, b) => {
          const dateA = new Date(a.completed_at || a.created_at).getTime();
          const dateB = new Date(b.completed_at || b.created_at).getTime();
          return dateB - dateA;
        }),
    [allMessages]
  );

  // คำนวณผลงานและประวัติของช่างแต่ละคน (นับรวมทั้ง pending และ in_progress เป็นงานที่ถืออยู่ในมือ)
  const technicianStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    return technicians.map((tech) => {
      const techCompleted = completedMessages.filter((m) => m.technician_id === tech.u_id);
      const techActive = allMessages.filter(
        (m) => m.repair_status !== 'completed' && m.technician_id === tech.u_id
      );

      const totalRevenue = techCompleted.reduce(
        (sum, m) => sum + (m.final_price ?? m.service_price ?? 0),
        0
      );

      const weeklyCompletedCount = techCompleted.filter((m) => {
        const d = new Date(m.completed_at || m.created_at);
        return d >= sevenDaysAgo;
      }).length;

      const latestCompletedJob = techCompleted[0] || null;
      const lastCompletedAt = latestCompletedJob
        ? latestCompletedJob.completed_at || latestCompletedJob.created_at
        : null;

      return {
        ...tech,
        completedCount: techCompleted.length,
        pendingCount: techActive.length,
        weeklyCompletedCount,
        totalRevenue,
        lastCompletedAt,
      };
    });
  }, [technicians, completedMessages, allMessages]);

  // กรองรายการประวัติตามเงื่อนไขที่เลือก
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    return completedMessages.filter((m) => {
      if (selectedTechId !== 'all' && String(m.technician_id) !== selectedTechId) {
        return false;
      }

      if (selectedCategoryId !== 'all' && m.category_id !== selectedCategoryId) {
        return false;
      }

      const finishedDate = new Date(m.completed_at || m.created_at);
      if (periodFilter === 'today' && finishedDate < startOfToday) return false;
      if (periodFilter === 'weekly' && finishedDate < sevenDaysAgo) return false;
      if (periodFilter === 'monthly' && finishedDate < thirtyDaysAgo) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = m.cm_username.toLowerCase().includes(q);
        const matchPhone = m.cm_cel.toLowerCase().includes(q);
        const matchService = (m.service_name || '').toLowerCase().includes(q);
        const matchSymptom = m.cm_symptom.toLowerCase().includes(q);
        const matchTech = `${m.technician_name || ''} ${m.technician_surname || ''}`
          .toLowerCase()
          .includes(q);
        const matchId = `#${m.cm_id}`.includes(q);
        if (!matchName && !matchPhone && !matchService && !matchSymptom && !matchTech && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [completedMessages, selectedTechId, selectedCategoryId, periodFilter, search]);

  const totalPermanentRevenue = useMemo(
    () =>
      completedMessages.reduce((sum, m) => sum + (m.final_price ?? m.service_price ?? 0), 0),
    [completedMessages]
  );

  const filteredRevenue = useMemo(
    () =>
      filteredHistory.reduce((sum, m) => sum + (m.final_price ?? m.service_price ?? 0), 0),
    [filteredHistory]
  );

  return (
    <div
      key={flashKey}
      className={`space-y-6 text-slate-100 rounded-2xl ${
        flashKey > 0 ? 'animate-refresh-flash' : ''
      }`}
    >
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-950 border border-emerald-800/60 text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              ประวัติงานซ่อมที่ส่งมอบแล้ว & ผลงานช่าง
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            รวบรวมรายการซ่อมที่ส่งมอบงานเรียบร้อยแล้ว พร้อมติดตามสถิติการทำงานของช่างแต่ละคน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</span>
          </button>

          <Link
            to="/admin/inbox"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-sky-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปคิวงานซ่อม</span>
          </Link>
        </div>
      </div>

      {/* 1. REVENUE & COMPLETION SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-emerald-800/50 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
            <span>ยอดรายรับสุทธิสะสม</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            ฿{totalPermanentRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>บันทึกยอดตามจริงเมื่อส่งมอบงาน</span>
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>จำนวนงานที่ส่งมอบสำเร็จ</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {completedMessages.length}{' '}
            <span className="text-xs font-normal text-slate-400">รายการ</span>
          </p>
          <p className="text-[11px] text-slate-400">ซ่อมเสร็จและส่งมอบเรียบร้อยแล้ว</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
            <span>ยอดรวมตามตัวกรองที่เลือก</span>
            <Filter className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
            ฿{filteredRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400">
            จาก {filteredHistory.length} รายการที่แสดงด้านล่าง
          </p>
        </div>
      </div>

      {/* 2. PER-TECHNICIAN TRACK RECORD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              <span>ตารางติดตามผลงานช่างแต่ละคน (คลิกเพื่อกรองดูประวัติรายคน)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ตรวจสอบจำนวนงานที่ส่งมอบแล้ว งานที่กำลังดำเนินการ และเวลาที่ส่งมอบงานล่าสุด
            </p>
          </div>
          {selectedTechId !== 'all' && (
            <button
              onClick={() => setSelectedTechId('all')}
              className="px-3 py-1.5 rounded-xl bg-sky-600/20 border border-sky-500/40 text-sky-300 text-xs font-bold hover:bg-sky-600/30 transition-colors cursor-pointer self-start sm:self-auto"
            >
              แสดงช่างทุกคน ({completedMessages.length} งาน)
            </button>
          )}
        </div>

        {technicianStats.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">ยังไม่มีรายชื่อช่างในระบบ</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {technicianStats.map((tech) => {
              const isSelected = selectedTechId === String(tech.u_id);
              return (
                <div
                  key={tech.u_id}
                  onClick={() => setSelectedTechId(isSelected ? 'all' : String(tech.u_id))}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500 ring-1 ring-sky-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-800/60 text-sky-400 flex items-center justify-center font-bold text-sm shrink-0">
                        {tech.u_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs sm:text-sm truncate">
                          ช่าง {tech.u_name} {tech.u_surname}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{tech.cel}</p>
                      </div>
                    </div>

                    {tech.completedCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shrink-0">
                        7 วันนี้: {tech.weeklyCompletedCount} งาน
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ยังไม่มีงานส่งมอบ</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ส่งมอบแล้ว</span>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-400">
                        {tech.completedCount}
                      </span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[10px] text-slate-400 block">กำลังถืออยู่</span>
                      <span className="text-sm sm:text-base font-extrabold text-amber-400">
                        {tech.pendingCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">ยอดรวม</span>
                      <span className="text-xs sm:text-sm font-extrabold text-sky-400 font-mono">
                        ฿{tech.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="truncate">
                      {tech.lastCompletedAt
                        ? `ส่งงานล่าสุด: ${new Date(tech.lastCompletedAt).toLocaleDateString(
                            'th-TH',
                            {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}`
                        : 'ยังไม่เคยส่งมอบงาน'}
                    </span>
                    <span className="text-sky-400 font-semibold shrink-0 ml-2">
                      {isSelected ? 'กำลังกรอง ✓' : 'คลิกดูประวัติ →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. FILTER BAR FOR COMPLETED REPAIRS */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'today', label: 'วันนี้' },
                { id: 'weekly', label: '7 วันล่าสุด' },
                { id: 'monthly', label: '30 วันล่าสุด' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodFilter(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  periodFilter === p.id
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">ช่างทั้งหมด</option>
              {technicians.map((t) => (
                <option key={t.u_id} value={String(t.u_id)}>
                  ช่าง {t.u_name} {t.u_surname}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoryId}
              onChange={(e) =>
                setSelectedCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="all">หมวดหมู่ทั้งหมด</option>
              {categories.map((c) => (
                <option key={c.cg_id} value={c.cg_id}>
                  {c.cg_name}
                </option>
              ))}
            </select>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อลูกค้า, เบอร์โทร, บริการ..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMPLETED HISTORY LIST */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            กำลังโหลดประวัติการซ่อม...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            ไม่พบประวัติงานซ่อมที่ส่งมอบแล้วตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="md:hidden divide-y divide-slate-800">
              {filteredHistory.map((item) => {
                const price = item.final_price ?? item.service_price ?? 0;
                const doneDate = item.completed_at || item.created_at;
                return (
                  <div
                    key={item.cm_id}
                    onClick={() => setSelectedReceipt(item)}
                    className="p-4 space-y-2.5 hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[11px] font-bold text-slate-300">
                          #{item.cm_id}
                        </span>
                        <span className="font-bold text-white text-sm">{item.cm_username}</span>
                      </div>
                      <span className="font-mono font-extrabold text-sm text-emerald-400">
                        +฿{price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-300 font-medium">
                      <span>{item.service_name || 'บริการซ่อมมาตรฐาน'}</span>
                      {item.promo_code && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/70 border border-amber-800 text-amber-300">
                          -20% ({item.promo_code})
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      อาการ: {item.cm_symptom}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span className="text-sky-400 font-semibold flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        {item.technician_name ? `ช่าง ${item.technician_name}` : 'ไม่ระบุช่าง'}
                      </span>
                      <span>
                        ส่งมอบ:{' '}
                        {new Date(doneDate).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">รหัสใบงาน</th>
                    <th className="py-3 px-4 font-semibold">ลูกค้า</th>
                    <th className="py-3 px-4 font-semibold">บริการที่ดำเนินการ</th>
                    <th className="py-3 px-4 font-semibold">ช่างผู้รับผิดชอบ</th>
                    <th className="py-3 px-4 font-semibold">ยอดค่าบริการสุทธิ</th>
                    <th className="py-3 px-4 font-semibold">เวลาที่ส่งมอบงาน</th>
                    <th className="py-3 px-4 font-semibold text-right">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredHistory.map((item) => {
                    const price = item.final_price ?? item.service_price ?? 0;
                    const doneDate = item.completed_at || item.created_at;
                    return (
                      <tr
                        key={item.cm_id}
                        onClick={() => setSelectedReceipt(item)}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                          #{item.cm_id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-white">{item.cm_username}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{item.cm_cel}</p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium text-slate-200">
                              {item.service_name || 'บริการซ่อมมาตรฐาน'}
                            </span>
                            {item.category_name && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800/60">
                                {item.category_name}
                              </span>
                            )}
                            {item.promo_code && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/60">
                                -20% ({item.promo_code})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.cm_symptom}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          {item.technician_name ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-300 font-semibold">
                              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                              <span>
                                ช่าง {item.technician_name} {item.technician_surname || ''}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-500">ไม่ระบุช่าง</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-extrabold text-sm text-emerald-400">
                            ฿{price.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-emerald-500/80">
                            ส่งมอบงานแล้ว
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                          {new Date(doneDate).toLocaleString('th-TH', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReceipt(item);
                            }}
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="ดูใบสรุปงานซ่อม"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* 5. COMPLETED JOB RECEIPT MODAL (Click outside to close) */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl animate-modal max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-slate-200">
                  ใบงาน #{selectedReceipt.cm_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ส่งมอบงานเรียบร้อยแล้ว</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-emerald-300 font-bold uppercase">
                  ยอดค่าบริการสุทธิ
                </p>
                <p className="text-xs text-slate-200 font-semibold mt-0.5">
                  {selectedReceipt.service_name || 'บริการซ่อมมาตรฐาน'}
                </p>
                {selectedReceipt.promo_code && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/70 text-amber-300 font-bold text-[10px]">
                    <Tag className="w-3 h-3" />
                    <span>ใช้โค้ดส่วนลด: {selectedReceipt.promo_code} (-20%)</span>
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                ฿
                {(
                  selectedReceipt.final_price ??
                  selectedReceipt.service_price ??
                  0
                ).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">ข้อมูลลูกค้า</p>
                <p className="font-bold text-white text-sm">{selectedReceipt.cm_username}</p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-mono">{selectedReceipt.cm_cel}</span>
                </p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span className="truncate">{selectedReceipt.cm_email}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">ช่างผู้ส่งมอบงาน</p>
                <p className="font-bold text-sky-300 text-sm flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>
                    {selectedReceipt.technician_name
                      ? `ช่าง ${selectedReceipt.technician_name} ${
                          selectedReceipt.technician_surname || ''
                        }`
                      : 'ไม่ระบุช่าง'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    รับเรื่อง: {new Date(selectedReceipt.created_at).toLocaleString('th-TH')}
                  </span>
                </p>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    ส่งมอบเมื่อ:{' '}
                    {new Date(
                      selectedReceipt.completed_at || selectedReceipt.created_at
                    ).toLocaleString('th-TH')}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <p className="font-bold text-slate-300 mb-1">อาการเสียที่ลูกค้าแจ้ง:</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedReceipt.cm_symptom}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-300 mb-1">บันทึกการซ่อมของช่าง:</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedReceipt.comment || 'ไม่มีบันทึกเพิ่มเติม'}
                </div>
              </div>
            </div>

            {selectedReceipt.cm_image && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-300">รูปภาพประกอบ:</p>
                <div
                  onClick={() =>
                    setLightboxImage({
                      src: selectedReceipt.cm_image!,
                      alt: `ใบงาน #${selectedReceipt.cm_id}`,
                    })
                  }
                  className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-slate-800 max-h-44 bg-slate-950 flex items-center justify-center"
                >
                  <img
                    src={selectedReceipt.cm_image}
                    alt="Repair attachment"
                    className="max-h-44 object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1">
                    <ZoomIn className="w-4 h-4" />
                    <span>ขยายรูปภาพ</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
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
