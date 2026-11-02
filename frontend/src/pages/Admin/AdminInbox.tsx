import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Mail,
  PhoneCall,
  Calendar,
  X,
  MessageSquare,
  ZoomIn,
  Wrench,
  AlertCircle,
  UserCheck,
  UserX,
  UserCog,
  FileCheck2,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import type { Category, InboxMessage, Service, User } from '../../types';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const AdminInbox: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState<string>('');

  // Categories, Services and Technicians metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Selected message for detail modal
  const [selectedMsg, setSelectedMsg] = useState<InboxMessage | null>(null);
  const [updateServiceId, setUpdateServiceId] = useState<number | null>(null);
  const [updateTechnicianId, setUpdateTechnicianId] = useState<number | null>(null);
  const [updateComment, setUpdateComment] = useState<string>('');
  const [serviceValidationError, setServiceValidationError] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  // Auto-hide Toast Alert
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => setToastAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  // Delete message confirmation
  const [deleteTarget, setDeleteTarget] = useState<InboxMessage | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Fetch Categories, Services & Technicians on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, srvRes, userRes] = await Promise.all([
          apiRequest<Category[]>('/categories'),
          apiRequest<Service[]>('/services'),
          apiRequest<User[]>('/users'),
        ]);
        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (srvRes.success && srvRes.data) setServices(srvRes.data);
        if (userRes.success && userRes.data) {
          setTechnicians(userRes.data.filter((u) => u.role === 'technician'));
        }
      } catch (err) {
        console.error('Error fetching categories, services, or technicians:', err);
      }
    };
    fetchMetadata();
  }, []);

  // ดึงเฉพาะรายการที่ "รอซ่อม (pending)" เท่านั้น เพราะรายการที่ซ่อมเสร็จจะย้ายไปหน้าประวัติการซ่อม (/admin/history)
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params: any = {
        repair_status: 'pending',
      };
      if (readFilter !== 'all') params.read_status = readFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;
      if (serviceFilter !== 'all') params.service_id = serviceFilter;
      if (technicianFilter !== 'all') params.technician_id = technicianFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiRequest<InboxMessage[]>('/inbox', { params });
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Error fetching inbox messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [readFilter, categoryFilter, serviceFilter, technicianFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  // Open Message Detail (Marks read via PATCH /api/inbox/:id/read, then fetches detail via GET /api/inbox/:id)
  const openMessageDetail = async (msg: InboxMessage) => {
    setSelectedMsg(msg);
    setUpdateServiceId(msg.service_id ?? null);
    setUpdateTechnicianId(msg.technician_id ?? null);
    setUpdateComment(msg.comment || '');
    setServiceValidationError('');
    setConfirmFinalizeOpen(false);

    try {
      if (!msg.is_read) {
        await apiRequest(`/inbox/${msg.cm_id}/read`, { method: 'PATCH' });
      }
      const res = await apiRequest<InboxMessage>(`/inbox/${msg.cm_id}`);
      if (res.success && res.data) {
        setSelectedMsg({ ...res.data, is_read: true });
        setUpdateServiceId(res.data.service_id ?? null);
        setUpdateTechnicianId(res.data.technician_id ?? null);
        setMessages((prev) =>
          prev.map((m) => (m.cm_id === msg.cm_id ? { ...m, is_read: true } : m))
        );
      }
    } catch (err) {
      console.error('Error opening message:', err);
    }
  };

  // 1. บันทึกความคืบหน้า (ยังคงสถานะรอซ่อม pending)
  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg) return;
    setServiceValidationError('');
    setUpdating(true);

    try {
      const payload: any = {
        repair_status: 'pending',
        comment: updateComment.trim() || null,
        service_id: updateServiceId || null,
      };
      if (user?.role === 'admin') {
        payload.technician_id = updateTechnicianId;
      }

      const res = await apiRequest<{ success: boolean; data: any }>(
        `/inbox/${selectedMsg.cm_id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        setToastAlert('บันทึกความคืบหน้างานซ่อมเรียบร้อยแล้ว');
        setSelectedMsg(null);
        fetchMessages();
      }
    } catch (err: any) {
      setServiceValidationError(err.message || 'ไม่สามารถบันทึกความคืบหน้าได้');
    } finally {
      setUpdating(false);
    }
  };

  // 2. ตรวจสอบก่อนเปิดกล่องยืนยัน "ส่งมอบงาน & คิดเงินถาวร"
  const handleInitiateFinalize = () => {
    if (!updateServiceId) {
      setServiceValidationError(
        'กรุณาเลือก "บริการที่ซ่อมจริง" ก่อนกดส่งมอบงานและคิดเงิน เพื่อคำนวณยอดเงินเข้าบัญชี'
      );
      return;
    }
    if (user?.role === 'admin' && !updateTechnicianId) {
      setServiceValidationError(
        'กรุณาเลือก "ช่างผู้รับผิดชอบ" ก่อนส่งมอบงาน เพื่อบันทึกผลงานลงในประวัติของช่าง'
      );
      return;
    }
    setServiceValidationError('');
    setConfirmFinalizeOpen(true);
  };

  // 3. ยืนยันส่งมอบงานและคิดเงินเข้าบัญชีถาวร (ย้ายไปหน้าประวัติการซ่อม)
  const handleConfirmFinalizeAndBill = async () => {
    if (!selectedMsg || !updateServiceId) return;
    setUpdating(true);
    setServiceValidationError('');

    try {
      const payload: any = {
        repair_status: 'completed',
        comment: updateComment.trim() || null,
        service_id: updateServiceId,
      };
      if (user?.role === 'admin') {
        payload.technician_id = updateTechnicianId;
      }

      const res = await apiRequest<{ success: boolean; data: any }>(
        `/inbox/${selectedMsg.cm_id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        setConfirmFinalizeOpen(false);
        setSelectedMsg(null);
        setToastAlert('ส่งมอบงานและบันทึกยอดเงินเข้าบัญชีถาวรแล้ว (ย้ายไปหน้าประวัติการซ่อม)');
        fetchMessages();
      }
    } catch (err: any) {
      setServiceValidationError(err.message || 'ไม่สามารถส่งมอบงานได้');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Message (DELETE /api/inbox/:id - Admin only)
  const handleDeleteMessage = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await apiRequest(`/inbox/${deleteTarget.cm_id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setDeleteTarget(null);
        if (selectedMsg?.cm_id === deleteTarget.cm_id) {
          setSelectedMsg(null);
        }
        fetchMessages();
      }
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบข้อความได้');
    } finally {
      setDeleting(false);
    }
  };

  const unreadTotal = messages.filter((m) => !m.is_read).length;

  // Filter services shown in dropdown based on selected category
  const filteredServicesForDropdown =
    categoryFilter === 'all'
      ? services
      : services.filter((s) => s.cg_id === categoryFilter);

  // ช่างสามารถแก้ได้เฉพาะงานของตัวเอง หรืองานที่ยังไม่มีผู้รับผิดชอบ
  const isLockedForCurrentTechnician =
    user?.role === 'technician' &&
    Boolean(selectedMsg?.technician_id && selectedMsg.technician_id !== user.u_id);

  const selectedServiceObj = services.find((s) => s.id === updateServiceId) || null;
  const selectedTechObj =
    user?.role === 'technician'
      ? user
      : technicians.find((t) => t.u_id === updateTechnicianId) || null;

  return (
    <div className="space-y-5 text-slate-100">
      {/* Lightbox Modal */}
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400">
              <Inbox className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              คิวงานแจ้งซ่อมที่รอดำเนินการ (Active Inbox)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            แสดงเฉพาะงานที่กำลังรอประเมินหรือกำลังซ่อม เมื่อกดส่งมอบงานและคิดเงินแล้ว รายการจะย้ายไปที่หน้าประวัติการซ่อมโดยอัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {unreadTotal > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-800/70 text-sky-300 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span>ข้อความใหม่ {unreadTotal} รายการ</span>
            </div>
          )}

          <Link
            to="/admin/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ดูประวัติการซ่อม & ผลงานช่าง</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        {/* Row 1: Read Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl text-xs font-semibold border border-slate-800 self-start">
            <button
              onClick={() => setReadFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                readFilter === 'all'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              คิวงานทั้งหมด ({messages.length})
            </button>
            <button
              onClick={() => setReadFilter('unread')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                readFilter === 'unread'
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>ยังไม่อ่าน</span>
              {unreadTotal > 0 && (
                <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => setReadFilter('read')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                readFilter === 'read'
                  ? 'bg-slate-800 text-slate-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              อ่านแล้ว
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์, อีเมล, อาการ..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </form>
        </div>

        {/* Row 2: Category, Service and Technician Filters */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              setCategoryFilter(val);
              setServiceFilter('all');
            }}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="all">หมวดหมู่: ทั้งหมด</option>
            {categories.map((cat) => (
              <option key={cat.cg_id} value={cat.cg_id}>
                หมวดหมู่: {cat.cg_name}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 cursor-pointer truncate"
          >
            <option value="all">บริการ: ทั้งหมด</option>
            <option value="unassigned">บริการ: ยังไม่ระบุ (รอช่างประเมิน)</option>
            {filteredServicesForDropdown.map((srv) => (
              <option key={srv.id} value={srv.id.toString()}>
                {srv.name}
              </option>
            ))}
          </select>

          <select
            value={technicianFilter}
            onChange={(e) => setTechnicianFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-sky-500 cursor-pointer truncate"
          >
            <option value="all">ช่างผู้รับผิดชอบ: ทั้งหมด</option>
            <option value="unassigned">ช่าง: ยังไม่มีผู้รับผิดชอบ</option>
            {technicians.map((t) => (
              <option key={t.u_id} value={t.u_id.toString()}>
                ช่าง {t.u_name} {t.u_surname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages List (Responsive Mobile Cards + Desktop Table) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            กำลังโหลดคิวงานซ่อม...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <p className="text-xs text-slate-400">
              ไม่มีคิวงานรอซ่อมในเงื่อนไขนี้ (งานที่ส่งมอบแล้วจะอยู่ในหน้าประวัติการซ่อม)
            </p>
            <Link
              to="/admin/history"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:underline"
            >
              <span>ไปดูหน้าประวัติการซ่อมทั้งหมด →</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile View (< md): Compact Cards */}
            <div className="md:hidden divide-y divide-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.cm_id}
                  onClick={() => openMessageDetail(msg)}
                  className={`p-4 space-y-2.5 transition-colors cursor-pointer ${
                    !msg.is_read
                      ? 'bg-sky-950/20 hover:bg-sky-950/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!msg.is_read && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] font-bold text-slate-300 shrink-0">
                        #{msg.cm_id}
                      </span>
                      <span className="font-bold text-white text-sm truncate">
                        {msg.cm_username}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {msg.cm_cel}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    {msg.service_id ? (
                      <span className="font-medium text-slate-200 truncate">
                        {msg.service_name}
                      </span>
                    ) : (
                      <span className="text-amber-300 text-[11px] font-semibold">
                        ปรึกษาช่าง / รอประเมินบริการ
                      </span>
                    )}
                    {msg.service_price != null && (
                      <span className="font-mono font-bold text-emerald-400 shrink-0">
                        ฿{msg.service_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{msg.cm_symptom}</p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    {msg.technician_name ? (
                      <span className="text-sky-400 font-semibold flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        ช่าง {msg.technician_name}
                      </span>
                    ) : (
                      <span className="text-slate-500">ยังไม่มีช่างรับงาน</span>
                    )}

                    <span className="text-slate-400">
                      {new Date(msg.created_at).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (>= md): Clean Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-14 text-center">การอ่าน</th>
                    <th className="py-3 px-4 font-semibold">ลูกค้า & เบอร์ติดต่อ</th>
                    <th className="py-3 px-4 font-semibold">บริการที่เลือก & ราคาประเมิน</th>
                    <th className="py-3 px-4 font-semibold">อาการเสีย</th>
                    <th className="py-3 px-4 font-semibold">ช่างผู้รับผิดชอบ</th>
                    <th className="py-3 px-4 font-semibold">เวลาที่แจ้ง</th>
                    <th className="py-3 px-4 font-semibold text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {messages.map((msg) => (
                    <tr
                      key={msg.cm_id}
                      onClick={() => openMessageDetail(msg)}
                      className={`cursor-pointer transition-colors ${
                        !msg.is_read
                          ? 'bg-sky-950/20 hover:bg-sky-950/30 font-semibold'
                          : 'hover:bg-slate-800/40 font-normal'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        {!msg.is_read ? (
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400 shadow-xs shadow-sky-400/50"
                            title="ข้อความใหม่"
                          ></span>
                        ) : (
                          <span className="text-[10px] text-slate-500">อ่านแล้ว</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">
                          #{msg.cm_id} • {msg.cm_username}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {msg.cm_cel}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {msg.service_id ? (
                          <>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-medium text-slate-200 line-clamp-1">
                                {msg.service_name}
                              </p>
                              {msg.category_name && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-950 text-sky-400 border border-sky-800/60">
                                  {msg.category_name}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-emerald-400 font-mono">
                              ฿{(msg.service_price ?? 0).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/60">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>รอช่างประเมินบริการ</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-300 line-clamp-1">{msg.cm_symptom}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        {msg.technician_name ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-300 font-semibold whitespace-nowrap">
                            <Wrench className="w-3 h-3 text-sky-400" />
                            <span>
                              ช่าง {msg.technician_name} {msg.technician_surname || ''}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 whitespace-nowrap">
                            <UserX className="w-3 h-3 text-slate-500" />
                            <span>ยังไม่มีผู้รับผิดชอบ</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleString('th-TH', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openMessageDetail(msg)}
                            title="จัดการงานซ่อม / ส่งมอบงาน"
                            className="p-1.5 rounded-lg text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => setDeleteTarget(msg)}
                              title="ลบข้อความนี้ (เฉพาะ Admin)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MESSAGE DETAIL & BILLING HANDOVER MODAL */}
      {/* ======================================================== */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-slate-200">
                  Ticket #{selectedMsg.cm_id}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>กำลังดำเนินการซ่อม</span>
                </span>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer, Service & Technician Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">ข้อมูลลูกค้า</p>
                <p className="font-bold text-white text-sm">{selectedMsg.cm_username}</p>
                <p className="text-slate-300 flex items-center gap-1.5 pt-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <a
                    href={`tel:${selectedMsg.cm_cel}`}
                    className="hover:underline font-mono text-sky-400"
                  >
                    {selectedMsg.cm_cel}
                  </a>
                </p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <a
                    href={`mailto:${selectedMsg.cm_email}`}
                    className="hover:underline text-sky-400 truncate"
                  >
                    {selectedMsg.cm_email}
                  </a>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">บริการที่แจ้งซ่อม</p>
                {selectedMsg.service_id ? (
                  <>
                    <p className="font-bold text-white text-xs line-clamp-2">
                      {selectedMsg.service_name}
                    </p>
                    <p className="text-emerald-400 font-extrabold text-sm font-mono">
                      ฿{(selectedMsg.service_price ?? 0).toLocaleString()} บาท
                    </p>
                  </>
                ) : (
                  <p className="text-amber-300 font-semibold text-xs">
                    ลูกค้าไม่แน่ใจอาการ (รอช่างเลือกบริการด้านล่าง)
                  </p>
                )}
                <p className="text-slate-400 text-[11px] flex items-center gap-1 pt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(selectedMsg.created_at).toLocaleString('th-TH')}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">ช่างผู้รับผิดชอบ</p>
                {selectedMsg.technician_name ? (
                  <div className="p-2 rounded-lg bg-sky-950/50 border border-sky-800/50 text-sky-300">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>
                        ช่าง {selectedMsg.technician_name} {selectedMsg.technician_surname || ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                    ยังไม่มีช่างรับงาน
                  </div>
                )}
              </div>
            </div>

            {/* Symptom Details */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-300">อาการเสียที่ลูกค้าแจ้ง:</h4>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                {selectedMsg.cm_symptom}
              </div>
            </div>

            {/* Product Image with Lightbox */}
            {selectedMsg.cm_image && (
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-300">รูปภาพประกอบ (คลิกเพื่อขยาย):</h4>
                <div
                  onClick={() =>
                    setLightboxImage({
                      src: selectedMsg.cm_image!,
                      alt: `Ticket #${selectedMsg.cm_id}`,
                    })
                  }
                  className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-slate-800 max-h-44 bg-slate-950 flex items-center justify-center"
                >
                  <img
                    src={selectedMsg.cm_image}
                    alt="Customer equipment"
                    className="max-h-44 object-contain"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs">
                    <ZoomIn className="w-4 h-4" />
                    <span>คลิกดูรูปขยาย</span>
                  </div>
                </div>
              </div>
            )}

            {/* Technician Workspace & Billing Form */}
            <form
              onSubmit={handleSaveProgress}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  บันทึกการซ่อม & ส่งมอบงานคิดเงิน
                </h4>
              </div>

              {/* Service Assignment Dropdown */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  <span>บริการที่ดำเนินการซ่อมจริง (Service):</span>
                </label>
                <select
                  disabled={isLockedForCurrentTechnician}
                  value={updateServiceId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setUpdateServiceId(val);
                    setConfirmFinalizeOpen(false);
                    if (val) setServiceValidationError('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500 cursor-pointer disabled:opacity-50"
                >
                  <option value="">-- ยังไม่ระบุบริการ (อยู่ระหว่างตรวจเช็คอาการ) --</option>
                  {categories.map((cat) => {
                    const catServices = services.filter((s) => s.cg_id === cat.cg_id);
                    if (catServices.length === 0) return null;
                    return (
                      <optgroup key={cat.cg_id} label={`หมวดหมู่: ${cat.cg_name}`}>
                        {catServices.map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} (฿{srv.price.toLocaleString()} บาท)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Technician Assignment */}
              {user?.role === 'admin' ? (
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <UserCog className="w-3.5 h-3.5 text-sky-400" />
                    <span>ช่างผู้รับผิดชอบงานซ่อม:</span>
                  </label>
                  <select
                    value={updateTechnicianId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setUpdateTechnicianId(val);
                      setConfirmFinalizeOpen(false);
                      if (val) setServiceValidationError('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="">-- เลือกช่างผู้รับผิดชอบ --</option>
                    {technicians.map((t) => (
                      <option key={t.u_id} value={t.u_id}>
                        ช่าง {t.u_name} {t.u_surname} ({t.cel})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  {selectedMsg.technician_id === user?.u_id ? (
                    <p className="text-emerald-400 font-semibold">
                      ✓ คุณ (ช่าง {user?.u_name} {user?.u_surname}) เป็นผู้รับผิดชอบงานนี้
                    </p>
                  ) : !selectedMsg.technician_id ? (
                    <p className="text-sky-300 font-medium">
                      ℹ️ เมื่อกดบันทึกหรือส่งมอบงาน ระบบจะผูกชื่อของคุณ (ช่าง {user?.u_name}{' '}
                      {user?.u_surname}) เป็นผู้รับผิดชอบทันที
                    </p>
                  ) : (
                    <p className="text-amber-300 font-semibold">
                      🔒 งานนี้อยู่ในความรับผิดชอบของ ช่าง {selectedMsg.technician_name}{' '}
                      {selectedMsg.technician_surname || ''}
                    </p>
                  )}
                </div>
              )}

              {/* Comment Field */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">
                  บันทึกการซ่อม / รายละเอียดแจ้งลูกค้า:
                </label>
                <textarea
                  rows={2}
                  disabled={isLockedForCurrentTechnician}
                  value={updateComment}
                  onChange={(e) => setUpdateComment(e.target.value)}
                  placeholder="ระบุการซ่อม เช่น เปลี่ยนอะไหล่เรียบร้อย ทดสอบผ่านทุกจุด..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 disabled:opacity-50"
                ></textarea>
              </div>

              {/* Validation Error Alert */}
              {serviceValidationError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{serviceValidationError}</span>
                </div>
              )}

              {/* Inline Permanent Billing Confirmation Box */}
              {confirmFinalizeOpen && selectedServiceObj && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/70 space-y-3 animate-fade">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-emerald-300 text-sm">
                        ยืนยันการส่งมอบงานและคิดเงินเข้าบัญชีอย่างถาวร?
                      </p>
                      <p className="text-slate-300">
                        บริการ: <strong className="text-white">{selectedServiceObj.name}</strong>
                      </p>
                      <p className="text-slate-300">
                        ช่างผู้ส่งงาน:{' '}
                        <strong className="text-sky-300">
                          {selectedTechObj
                            ? `ช่าง ${selectedTechObj.u_name} ${selectedTechObj.u_surname}`
                            : 'ไม่ระบุ'}
                        </strong>
                      </p>
                      <p className="text-slate-300">
                        ยอดเงินที่จะบันทึกถาวร:{' '}
                        <strong className="text-emerald-400 font-mono text-sm">
                          ฿{selectedServiceObj.price.toLocaleString()} บาท
                        </strong>
                      </p>
                      <p className="text-[11px] text-slate-400 pt-0.5">
                        * เมื่อยืนยันแล้ว ยอดเงินจะถูกบันทึกเข้าบัญชีอย่างถาวร และใบงานจะย้ายไปอยู่ในหน้า "ประวัติการซ่อม" ทันที (ไม่สามารถเปลี่ยนกลับเป็นรอซ่อมได้)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmFinalizeOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handleConfirmFinalizeAndBill}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {updating ? 'กำลังบันทึก...' : '✓ ยืนยันคิดเงินถาวร & ส่งงาน'}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
                {user?.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedMsg)}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบใบแจ้งซ่อมนี้</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="submit"
                    disabled={updating || isLockedForCurrentTechnician}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-sky-400" />
                    <span>บันทึกความคืบหน้า (ยังซ่อมไม่เสร็จ)</span>
                  </button>

                  {!confirmFinalizeOpen && (
                    <button
                      type="button"
                      disabled={updating || isLockedForCurrentTechnician}
                      onClick={handleInitiateFinalize}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ส่งมอบงาน & คิดเงินถาวร</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl animate-modal">
            <div className="w-11 h-11 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ยืนยันการลบใบแจ้งซ่อม?</h3>
              <p className="text-xs text-slate-400 mt-1">
                ต้องการลบคำขอของ "{deleteTarget.cm_username}" (Ticket #{deleteTarget.cm_id}) หรือไม่?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Notification */}
      {toastAlert && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl animate-fade max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
          <span className="text-xs font-bold">{toastAlert}</span>
          <button
            onClick={() => setToastAlert(null)}
            className="ml-auto text-white/80 hover:text-white cursor-pointer font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
