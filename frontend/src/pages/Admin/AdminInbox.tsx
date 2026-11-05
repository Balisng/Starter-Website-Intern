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
  RefreshCw,
  PlayCircle,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import type { Category, InboxMessage, RepairStatus, Service, User } from '../../types';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const AdminInbox: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useService();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [flashKey, setFlashKey] = useState<number>(0);

  // Filters
  const [statusTab, setStatusTab] = useState<'active' | 'pending' | 'in_progress'>('active');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [search, setSearch] = useState<string>('');

  // Metadata
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');

  // Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Selected message for detail modal
  const [selectedMsg, setSelectedMsg] = useState<InboxMessage | null>(null);
  const [updateServiceId, setUpdateServiceId] = useState<number | null>(null);
  const [updateTechnicianId, setUpdateTechnicianId] = useState<number | null>(null);
  const [updateStatus, setUpdateStatus] = useState<RepairStatus>('pending');
  const [updateComment, setUpdateComment] = useState<string>('');
  const [serviceValidationError, setServiceValidationError] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState<boolean>(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<InboxMessage | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteTarget) {
          setDeleteTarget(null);
        } else if (selectedMsg) {
          setSelectedMsg(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMsg, deleteTarget]);

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
        console.error('Error fetching metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchMessages = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const params: any = {
        repair_status: statusTab,
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
      if (isManualRefresh) {
        setFlashKey((prev) => prev + 1);
        showToast('รีเฟรชข้อมูลคิวงานซ่อมล่าสุดเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Error fetching inbox messages:', err);
      if (isManualRefresh) {
        showToast('ไม่สามารถรีเฟรชข้อมูลได้ กรุณาลองอีกครั้ง', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
  }, [statusTab, readFilter, categoryFilter, serviceFilter, technicianFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(true);
  };

  // Open Message Detail
  const openMessageDetail = async (msg: InboxMessage) => {
    setSelectedMsg(msg);
    setUpdateServiceId(msg.service_id ?? null);
    setUpdateTechnicianId(msg.technician_id ?? null);
    setUpdateStatus(msg.repair_status === 'in_progress' ? 'in_progress' : 'pending');
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
        setUpdateStatus(res.data.repair_status === 'in_progress' ? 'in_progress' : 'pending');
        setMessages((prev) =>
          prev.map((m) => (m.cm_id === msg.cm_id ? { ...m, is_read: true } : m))
        );
      }
    } catch (err) {
      console.error('Error opening message:', err);
    }
  };

  // บันทึกสถานะ ('pending' หรือ 'in_progress') และข้อมูลงานซ่อม
  const handleUpdateWorkStatus = async (targetStatus: 'pending' | 'in_progress') => {
    if (!selectedMsg) return;
    setServiceValidationError('');
    setUpdating(true);

    try {
      const payload: any = {
        repair_status: targetStatus,
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
        showToast(
          targetStatus === 'in_progress'
            ? `รับงานและเปลี่ยนสถานะเป็น "กำลังซ่อม / ดำเนินการ" แล้ว`
            : 'บันทึกข้อมูลความคืบหน้างานซ่อมเรียบร้อยแล้ว'
        );
        setSelectedMsg(null);
        fetchMessages(false);
      }
    } catch (err: any) {
      setServiceValidationError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
      showToast(err.message || 'ไม่สามารถบันทึกข้อมูลได้', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // ตรวจสอบก่อนเปิดกล่องยืนยัน "ส่งมอบงานซ่อม"
  const handleInitiateFinalize = () => {
    if (!updateServiceId) {
      setServiceValidationError(
        'กรุณาเลือก "บริการที่ดำเนินการซ่อมจริง" ก่อนกดส่งมอบงานซ่อม'
      );
      return;
    }
    if (user?.role === 'admin' && !updateTechnicianId) {
      setServiceValidationError(
        'กรุณาเลือก "ช่างผู้รับผิดชอบ" ทางด้านซ้ายก่อนกดส่งมอบงานซ่อม'
      );
      return;
    }
    setServiceValidationError('');
    setConfirmFinalizeOpen(true);
  };

  // ยืนยันส่งมอบงานซ่อม (ย้ายไปหน้าประวัติการซ่อม)
  const handleConfirmFinalize = async () => {
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
        showToast('ส่งมอบงานซ่อมเรียบร้อยแล้ว (ย้ายไปยังหน้าประวัติการซ่อม)');
        fetchMessages(false);
      }
    } catch (err: any) {
      setServiceValidationError(err.message || 'ไม่สามารถส่งมอบงานได้');
      showToast(err.message || 'ไม่สามารถส่งมอบงานได้', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Message (Admin only)
  const handleDeleteMessage = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await apiRequest(`/inbox/${deleteTarget.cm_id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast(`ลบใบงาน #${deleteTarget.cm_id} เรียบร้อยแล้ว`);
        setDeleteTarget(null);
        if (selectedMsg?.cm_id === deleteTarget.cm_id) {
          setSelectedMsg(null);
        }
        fetchMessages(false);
      }
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถลบข้อความได้', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const unreadTotal = messages.filter((m) => !m.is_read).length;
  const pendingTotal = messages.filter((m) => m.repair_status === 'pending').length;
  const inProgressTotal = messages.filter((m) => m.repair_status === 'in_progress').length;

  const filteredServicesForDropdown =
    categoryFilter === 'all'
      ? services
      : services.filter((s) => s.cg_id === categoryFilter);

  // ช่างสามารถอัปเดตสถานะได้เฉพาะงานของตัวเอง หรืองานที่ยังไม่มีผู้รับผิดชอบ
  const isLockedForCurrentTechnician =
    user?.role === 'technician' &&
    Boolean(selectedMsg?.technician_id && selectedMsg.technician_id !== user.u_id);

  const selectedServiceObj = services.find((s) => s.id === updateServiceId) || null;
  const selectedTechObj =
    user?.role === 'technician'
      ? selectedMsg?.technician_id
        ? technicians.find((t) => t.u_id === selectedMsg.technician_id) || user
        : user
      : technicians.find((t) => t.u_id === updateTechnicianId) || null;

  const renderStatusBadge = (status: RepairStatus) => {
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/90 text-sky-300 border border-sky-700/70 whitespace-nowrap">
          <PlayCircle className="w-3 h-3 text-sky-400" />
          <span>กำลังซ่อม / ดำเนินการ</span>
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-700/70 whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>ส่งมอบงานแล้ว</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-700/70 whitespace-nowrap">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>รอรับงานซ่อม</span>
      </span>
    );
  };

  return (
    <div className="space-y-5 text-slate-100">
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-950 border border-sky-800/60 text-sky-400">
              <Inbox className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              คิวงานแจ้งซ่อมและสถานะการดำเนินงาน
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-pretty">
            <span className="inline-block">ตรวจสอบคำขอแจ้งซ่อม มอบหมายช่างผู้รับผิดชอบ</span>{' '}
            <span className="inline-block">และอัปเดตสถานะตั้งแต่รับงานจนถึงส่งมอบงาน</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {unreadTotal > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-sky-950 border border-sky-800 text-sky-300 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span>ข้อความใหม่ {unreadTotal} รายการ</span>
            </div>
          )}

          <button
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</span>
          </button>

          <Link
            to="/admin/history"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-colors"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ดูประวัติงานที่ส่งมอบแล้ว</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        {/* Row 1: Repair Status Tabs, Read Filter & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl text-xs font-semibold border border-slate-800">
              <button
                onClick={() => setStatusTab('active')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusTab === 'active'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                คิวงานทั้งหมด ({messages.length})
              </button>
              <button
                onClick={() => setStatusTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusTab === 'pending'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                รอรับงาน ({statusTab === 'active' ? pendingTotal : statusTab === 'pending' ? messages.length : '...'})
              </button>
              <button
                onClick={() => setStatusTab('in_progress')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusTab === 'in_progress'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                กำลังซ่อม ({statusTab === 'active' ? inProgressTotal : statusTab === 'in_progress' ? messages.length : '...'})
              </button>
            </div>

            {/* Read Status Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl text-xs font-semibold border border-slate-800">
              <button
                onClick={() => setReadFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  readFilter === 'all'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ทุกการอ่าน
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  readFilter === 'unread'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>ยังไม่อ่าน</span>
                {unreadTotal > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                )}
              </button>
              <button
                onClick={() => setReadFilter('read')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  readFilter === 'read'
                    ? 'bg-slate-800 text-slate-200 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                อ่านแล้ว
              </button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล, อาการ..."
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

      {/* Messages List */}
      <div
        key={flashKey}
        className={`rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden ${
          flashKey > 0 ? 'animate-refresh-flash' : ''
        }`}
      >
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            กำลังโหลดคิวงานซ่อม...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <p className="text-xs text-slate-400">
              ไม่มีคิวงานซ่อมในเงื่อนไขนี้ (รายการที่ส่งมอบแล้วจะอยู่ในหน้าประวัติการซ่อม)
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
                    {renderStatusBadge(msg.repair_status)}
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
                        ช่าง {msg.technician_name} {msg.technician_surname || ''}
                      </span>
                    ) : (
                      <span className="text-slate-500">ยังไม่มีช่างรับงาน</span>
                    )}

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => setDeleteTarget(msg)}
                          className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>ลบ</span>
                        </button>
                      )}
                    </div>
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
                    <th className="py-3 px-4 font-semibold">บริการ & ราคาประเมิน</th>
                    <th className="py-3 px-4 font-semibold">อาการเสีย</th>
                    <th className="py-3 px-4 font-semibold">สถานะงาน</th>
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
                            className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400"
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

                      <td className="py-3.5 px-4">{renderStatusBadge(msg.repair_status)}</td>

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
                            title="เปิดดูและจัดการใบงาน"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => setDeleteTarget(msg)}
                              title="ลบใบแจ้งซ่อมนี้"
                              className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
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
      {/* MESSAGE DETAIL MODAL (2-Column Layout + Click Outside to Close) */}
      {/* ======================================================== */}
      {selectedMsg && (
        <div
          onClick={() => setSelectedMsg(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl p-4 sm:p-6 space-y-4 shadow-2xl animate-modal relative max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-950 border border-slate-800 text-slate-200">
                  ใบงาน #{selectedMsg.cm_id}
                </span>
                {renderStatusBadge(selectedMsg.repair_status)}
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  • แจ้งเมื่อ {new Date(selectedMsg.created_at).toLocaleString('th-TH')}
                </span>
              </div>

              <button
                onClick={() => setSelectedMsg(null)}
                title="ปิดหน้าต่าง (หรือคลิกพื้นที่ด้านนอกกล่อง)"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-COLUMN BODY: Left = Customer, Service, Technician | Right = Description & Repair Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN (lg:col-span-5): ข้อมูลลูกค้า / บริการที่แจ้งซ่อม / ช่างผู้รับผิดชอบ */}
              <div className="lg:col-span-5 space-y-3.5">
                {/* 1. ข้อมูลลูกค้า */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    ข้อมูลลูกค้า
                  </p>
                  <p className="font-bold text-white text-sm">{selectedMsg.cm_username}</p>
                  <div className="space-y-1 pt-1 border-t border-slate-800/80">
                    <p className="text-slate-300 flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <a
                        href={`tel:${selectedMsg.cm_cel}`}
                        className="hover:underline font-mono text-sky-400 font-semibold"
                      >
                        {selectedMsg.cm_cel}
                      </a>
                    </p>
                    <p className="text-slate-300 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <a
                        href={`mailto:${selectedMsg.cm_email}`}
                        className="hover:underline text-sky-400 truncate"
                      >
                        {selectedMsg.cm_email}
                      </a>
                    </p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-2 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{new Date(selectedMsg.created_at).toLocaleString('th-TH')}</span>
                    </p>
                  </div>
                </div>

                {/* 2. บริการที่แจ้งซ่อม */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    บริการที่แจ้งซ่อม
                  </p>
                  {selectedMsg.service_id ? (
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs leading-snug">
                        {selectedMsg.service_name}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        {selectedMsg.category_name && (
                          <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/60 text-[10px] font-bold">
                            {selectedMsg.category_name}
                          </span>
                        )}
                        <span className="text-emerald-400 font-extrabold text-sm font-mono">
                          ฿{(selectedMsg.service_price ?? 0).toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-amber-300 font-semibold text-xs">
                      ลูกค้ายังไม่ระบุบริการ (รอช่างตรวจเช็คและเลือกบริการด้านขวา)
                    </p>
                  )}
                </div>

                {/* 3. ช่างผู้รับผิดชอบ (Admin เลือกได้ / ช่างเห็นแต่แก้ไขไม่ได้) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <UserCog className="w-3.5 h-3.5 text-sky-400" />
                      <span>ช่างผู้รับผิดชอบงานซ่อม</span>
                    </p>
                    {user?.role === 'technician' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        ดูได้อย่างเดียว
                      </span>
                    )}
                  </div>

                  {/* แสดงผู้รับผิดชอบปัจจุบัน */}
                  {selectedMsg.technician_name ? (
                    <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800/70 text-sky-200 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-white">
                          ช่าง {selectedMsg.technician_name} {selectedMsg.technician_surname || ''}
                        </p>
                        <p className="text-[11px] text-sky-300">
                          {selectedMsg.repair_status === 'in_progress'
                            ? 'สถานะ: กำลังดำเนินการซ่อมงานนี้'
                            : 'สถานะ: ได้รับมอบหมายงานนี้แล้ว'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                      ยังไม่มีช่างผู้รับผิดชอบงานนี้
                    </div>
                  )}

                  {/* เฉพาะ Admin เท่านั้นที่เลือกหรือเปลี่ยนช่างผู้รับผิดชอบได้ */}
                  {user?.role === 'admin' ? (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-semibold text-slate-300 block">
                        มอบหมายหรือเปลี่ยนช่างผู้รับผิดชอบ (เฉพาะ Admin):
                      </label>
                      <select
                        value={updateTechnicianId ?? ''}
                        onChange={(e) => {
                          const val = e.target.value ? Number(e.target.value) : null;
                          setUpdateTechnicianId(val);
                          setConfirmFinalizeOpen(false);
                          if (val) setServiceValidationError('');
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        <option value="">-- ยังไม่ระบุช่างผู้รับผิดชอบ --</option>
                        {technicians.map((t) => (
                          <option key={t.u_id} value={t.u_id}>
                            ช่าง {t.u_name} {t.u_surname} ({t.cel})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {selectedMsg.technician_id === user?.u_id
                        ? 'คุณเป็นผู้รับผิดชอบงานซ่อมนี้ สามารถอัปเดตสถานะและบันทึกการซ่อมทางด้านขวาได้'
                        : !selectedMsg.technician_id
                        ? 'เมื่อคุณกด "รับงานซ่อมนี้" ทางด้านขวา ระบบจะลงชื่อของคุณเป็นผู้รับผิดชอบอัตโนมัติ'
                        : 'งานนี้อยู่ในความรับผิดชอบของช่างท่านอื่น คุณสามารถดูรายละเอียดได้แต่ไม่สามารถแก้ไขได้'}
                    </p>
                  )}
                </div>

                {/* ปุ่มลบใบงานสำหรับ Admin (สีแดงชัดเจน) */}
                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedMsg)}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ลบใบแจ้งซ่อมนี้</span>
                  </button>
                )}
              </div>

              {/* RIGHT COLUMN (lg:col-span-7): รายละเอียดอาการเสีย (Description) & บันทึกการซ่อม / สถานะ */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. รายละเอียดอาการเสียที่ลูกค้าแจ้ง (พื้นที่กว้างอ่านสบายตา) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      รายละเอียดอาการเสีย (Description)
                    </h4>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-wrap break-words min-h-[84px]">
                    {selectedMsg.cm_symptom}
                  </div>

                  {/* รูปภาพประกอบ (ถ้ามี) */}
                  {selectedMsg.cm_image && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-bold text-slate-300">
                        รูปภาพประกอบจากลูกค้า (คลิกเพื่อดูภาพขนาดใหญ่):
                      </p>
                      <div
                        onClick={() =>
                          setLightboxImage({
                            src: selectedMsg.cm_image!,
                            alt: `ใบงาน #${selectedMsg.cm_id}`,
                          })
                        }
                        className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-slate-800 max-h-52 bg-slate-900 flex items-center justify-center"
                      >
                        <img
                          src={selectedMsg.cm_image}
                          alt="Customer equipment"
                          className="max-h-52 object-contain"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs">
                          <ZoomIn className="w-4 h-4" />
                          <span>คลิกดูรูปขนาดใหญ่</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. บันทึกการซ่อม & การจัดการสถานะงานซ่อม */}
                <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      บันทึกการซ่อมและอัปเดตสถานะงาน
                    </h4>
                  </div>

                  {/* เลือกบริการที่ซ่อมจริง */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-sky-400" />
                      <span>รายการบริการที่ดำเนินการซ่อมจริง:</span>
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

                  {/* บันทึกการซ่อม (พื้นที่กว้าง) */}
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-slate-300 block">
                      บันทึกการซ่อม / รายละเอียดความคืบหน้า:
                    </label>
                    <textarea
                      rows={4}
                      disabled={isLockedForCurrentTechnician}
                      value={updateComment}
                      onChange={(e) => setUpdateComment(e.target.value)}
                      placeholder="ระบุผลการตรวจเช็ค อะไหล่ที่เปลี่ยน หรือรายละเอียดงานซ่อม..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-sky-500 disabled:opacity-50"
                    ></textarea>
                  </div>

                  {/* Validation Error Alert */}
                  {serviceValidationError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{serviceValidationError}</span>
                    </div>
                  )}

                  {/* กล่องยืนยันก่อนส่งมอบงานซ่อม */}
                  {confirmFinalizeOpen && selectedServiceObj && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/70 space-y-3 animate-fade">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-emerald-300 text-sm">
                            ยืนยันการส่งมอบงานซ่อมรายการนี้?
                          </p>
                          <p className="text-slate-300">
                            บริการที่ดำเนินการ:{' '}
                            <strong className="text-white">{selectedServiceObj.name}</strong>
                          </p>
                          <p className="text-slate-300">
                            ช่างผู้รับผิดชอบ:{' '}
                            <strong className="text-sky-300">
                              {selectedTechObj
                                ? `ช่าง ${selectedTechObj.u_name} ${selectedTechObj.u_surname}`
                                : 'ไม่ระบุ'}
                            </strong>
                          </p>
                          <p className="text-slate-300">
                            ยอดค่าบริการสุทธิ:{' '}
                            <strong className="text-emerald-400 font-mono text-sm">
                              ฿{selectedServiceObj.price.toLocaleString()} บาท
                            </strong>
                          </p>
                          <p className="text-[11px] text-slate-400 pt-0.5">
                            เมื่อยืนยันส่งมอบงานแล้ว รายการนี้จะถูกบันทึกเข้าสู่หน้าประวัติการซ่อมพร้อมยอดค่าบริการทันที
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
                          onClick={handleConfirmFinalize}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {updating ? 'กำลังบันทึก...' : 'ยืนยันส่งมอบงานซ่อม'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ปุ่มเปลี่ยนสถานะการดำเนินงาน (รอรับงาน / รับงานซ่อมนี้-กำลังซ่อม / ส่งมอบงานซ่อม) */}
                  <div className="pt-2 border-t border-slate-800 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-400">
                      เลือกอัปเดตสถานะการดำเนินงาน:
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* ปุ่มที่ 1: บันทึกเป็นรอรับงานซ่อม (กรณี Admin มอบหมายช่างหรือบันทึกหมายเหตุเบื้องต้น) */}
                      <button
                        type="button"
                        disabled={updating || isLockedForCurrentTechnician}
                        onClick={() => handleUpdateWorkStatus('pending')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>บันทึกข้อมูล (รอรับงาน)</span>
                      </button>

                      {/* ปุ่มที่ 2: รับงานซ่อมนี้ / กำลังซ่อมและดำเนินการ */}
                      <button
                        type="button"
                        disabled={updating || isLockedForCurrentTechnician}
                        onClick={() => handleUpdateWorkStatus('in_progress')}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>
                          {selectedMsg.repair_status === 'in_progress'
                            ? 'อัปเดตงาน (กำลังซ่อม / ดำเนินการ)'
                            : 'รับงานซ่อมนี้ (เริ่มดำเนินการซ่อม)'}
                        </span>
                      </button>

                      {/* ปุ่มที่ 3: ส่งมอบงานซ่อม (ไม่มีคำว่า "(คิดเงินถาวร)") */}
                      {!confirmFinalizeOpen && (
                        <button
                          type="button"
                          disabled={updating || isLockedForCurrentTechnician}
                          onClick={handleInitiateFinalize}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-auto"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ส่งมอบงานซ่อม</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Click outside to close + Red Delete Button) */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 text-center space-y-4 shadow-2xl animate-modal"
          >
            <div className="w-11 h-11 rounded-xl bg-red-950/80 border border-red-800/70 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">ยืนยันการลบใบแจ้งซ่อม?</h3>
              <p className="text-xs text-slate-400 mt-1">
                ต้องการลบคำขอของ "{deleteTarget.cm_username}" (ใบงาน #{deleteTarget.cm_id}) หรือไม่?
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
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
