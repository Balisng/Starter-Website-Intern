import React, { useEffect, useState } from 'react';
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
  const [repairFilter, setRepairFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState<string>('');

  // Categories, Services and Technicians metadata for filtering and technician assignment
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all'); // 'all' | 'unassigned' | string(service_id)
  const [technicianFilter, setTechnicianFilter] = useState<string>('all'); // 'all' | 'unassigned' | string(u_id)

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Selected message for detail modal
  const [selectedMsg, setSelectedMsg] = useState<InboxMessage | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'pending' | 'completed'>('pending');
  const [updateServiceId, setUpdateServiceId] = useState<number | null>(null);
  const [updateTechnicianId, setUpdateTechnicianId] = useState<number | null>(null);
  const [updateComment, setUpdateComment] = useState<string>('');
  const [serviceValidationError, setServiceValidationError] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<string | null>(null);

  // Auto-hide Toast Alert
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => setToastAlert(null), 3500);
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

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (readFilter !== 'all') params.read_status = readFilter;
      if (repairFilter !== 'all') params.repair_status = repairFilter;
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
  }, [readFilter, repairFilter, categoryFilter, serviceFilter, technicianFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  // Open Message Detail (Auto marks read via GET /api/inbox/:id)
  const openMessageDetail = async (msg: InboxMessage) => {
    setSelectedMsg(msg);
    setUpdateStatus(msg.repair_status);
    setUpdateServiceId(msg.service_id ?? null);
    setUpdateTechnicianId(msg.technician_id ?? null);
    setUpdateComment(msg.comment || '');
    setServiceValidationError('');

    try {
      // Backend automatically updates is_read = true on GET /api/inbox/:id
      const res = await apiRequest<InboxMessage>(`/inbox/${msg.cm_id}`);
      if (res.success && res.data) {
        setSelectedMsg(res.data);
        setUpdateServiceId(res.data.service_id ?? null);
        setUpdateTechnicianId(res.data.technician_id ?? null);
        // Update local list state
        setMessages((prev) =>
          prev.map((m) => (m.cm_id === msg.cm_id ? { ...m, is_read: true } : m))
        );
      }
    } catch (err) {
      console.error('Error opening message:', err);
    }
  };

  // Update Status, Service, Technician & Comment (PATCH /api/inbox/:id/status)
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg) return;

    // กฎสำคัญมาก: หากจะเปลี่ยนสถานะเป็น "ซ่อมเสร็จแล้ว (completed)" ต้องมีการเลือกผูก Service ที่ซ่อมจริงก่อน (ห้ามปล่อย service_id เป็น null)
    if (updateStatus === 'completed' && !updateServiceId) {
      setServiceValidationError(
        'กรุณาเลือกบริการที่ซ่อมจริงก่อนเปลี่ยนสถานะเป็น "ซ่อมเสร็จแล้ว" เพื่อให้ระบบคำนวณรายรับใน Dashboard ได้ถูกต้อง 100%'
      );
      return;
    }
    setServiceValidationError('');

    setUpdating(true);
    try {
      const payload: any = {
        repair_status: updateStatus,
        comment: updateComment.trim() || null,
        service_id: updateServiceId || null,
      };

      // หากเป็น Admin ให้อนุญาตกำหนดช่างผู้รับผิดชอบ หรือยกเลิก (null) ได้
      // หากเป็นช่าง Backend จะผูก u_id ของช่างที่ล็อกอินให้อัตโนมัติ
      if (user?.role === 'admin') {
        payload.technician_id = updateTechnicianId;
      }

      const res = await apiRequest<{ success: boolean; data: any; message?: string }>(
        `/inbox/${selectedMsg.cm_id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }
      );

      if (res.success) {
        // Requirement 1.2: แสดงแจ้งเตือนว่า "บันทึกข้อมูลสำเร็จ" และสั่งปิดหน้าต่าง modal อัตโนมัติ พร้อมอัปเดตข้อมูลตารางทันที
        setToastAlert('บันทึกข้อมูลสำเร็จ');
        setSelectedMsg(null);
        fetchMessages();
      }
    } catch (err: any) {
      setServiceValidationError(err.message || 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Message (DELETE /api/inbox/:id)
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
  const filteredServicesForDropdown = categoryFilter === 'all'
    ? services
    : services.filter((s) => s.cg_id === categoryFilter);

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Lightbox Modal */}
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-400">
              <Inbox className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              กล่องข้อความแจ้งซ่อม (Inbox)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            เปิดอ่านข้อความเพื่อดูข้อมูลลูกค้า อัปเดตสถานะงานซ่อม และใส่ความคิดเห็นของช่าง
          </p>
        </div>

        {unreadTotal > 0 && (
          <div className="px-3.5 py-1.5 rounded-full bg-rose-950/70 border border-rose-800/70 text-rose-300 text-xs font-bold flex items-center gap-2 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            <span>ยังไม่ได้อ่าน {unreadTotal} ข้อความ</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar (Dark Mode) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xs space-y-3.5">
        
        {/* Row 1: Read Tabs, Status Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Read Status: ทั้งหมด / ยังไม่อ่าน / อ่านแล้ว */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl text-xs font-semibold border border-slate-800">
              <button
                onClick={() => setReadFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  readFilter === 'all' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ข้อความทั้งหมด
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  readFilter === 'unread' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>ยังไม่ได้อ่าน</span>
                {unreadTotal > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => setReadFilter('read')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  readFilter === 'read' ? 'bg-slate-800 text-slate-200 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                อ่านแล้ว
              </button>
            </div>

            {/* Repair Status Filter */}
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl text-xs font-semibold border border-slate-800">
              <button
                onClick={() => setRepairFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  repairFilter === 'all' ? 'bg-slate-800 text-slate-200 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                สถานะทั้งหมด
              </button>
              <button
                onClick={() => setRepairFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  repairFilter === 'pending' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                รอซ่อม
              </button>
              <button
                onClick={() => setRepairFilter('completed')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  repairFilter === 'completed' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60' : 'text-slate-400 hover:text-white'
                }`}
              >
                ซ่อมเสร็จแล้ว
              </button>
            </div>

          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์, อีเมล, อาการ..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
            />
          </form>

        </div>

        {/* Row 2: Category, Service and Technician Filters */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <Wrench className="w-3.5 h-3.5 text-sky-400" />
            <span>กรองงานสำหรับช่าง:</span>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium">หมวดหมู่:</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                setCategoryFilter(val);
                setServiceFilter('all');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 cursor-pointer"
            >
              <option value="all">หมวดหมู่ทั้งหมด</option>
              {categories.map((cat) => (
                <option key={cat.cg_id} value={cat.cg_id}>
                  {cat.cg_name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium">บริการ:</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 cursor-pointer max-w-[240px] truncate"
            >
              <option value="all">บริการทั้งหมด</option>
              <option value="unassigned">⚠️ ยังไม่ระบุบริการ (ไม่แน่ใจอาการ / null)</option>
              {filteredServicesForDropdown.map((srv) => (
                <option key={srv.id} value={srv.id.toString()}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Technician Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium">ช่างผู้รับผิดชอบ:</label>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="all">ช่างทั้งหมด</option>
              <option value="unassigned">⚠️ ยังไม่มีผู้รับผิดชอบ</option>
              {technicians.map((t) => (
                <option key={t.u_id} value={t.u_id.toString()}>
                  ช่าง {t.u_name} {t.u_surname}
                </option>
              ))}
            </select>
          </div>

          {(categoryFilter !== 'all' || serviceFilter !== 'all' || technicianFilter !== 'all') && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setServiceFilter('all');
                setTechnicianFilter('all');
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>

      </div>

      {/* Messages List Table (Dark Mode) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">กำลังโหลดกล่องข้อความ...</div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-normal">ไม่พบข้อความแจ้งซ่อมในเงื่อนไขนี้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold w-12 text-center">สถานะ</th>
                  <th className="py-3 px-4 font-semibold">ลูกค้า & การติดต่อ</th>
                  <th className="py-3 px-4 font-semibold">บริการที่เลือก & ราคา</th>
                  <th className="py-3 px-4 font-semibold">อาการเสีย</th>
                  <th className="py-3 px-4 font-semibold">ช่างผู้รับผิดชอบ</th>
                  <th className="py-3 px-4 font-semibold">สถานะงานซ่อม</th>
                  <th className="py-3 px-4 font-semibold">เวลาที่แจ้งซ่อม</th>
                  <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {messages.map((msg) => (
                  <tr
                    key={msg.cm_id}
                    onClick={() => openMessageDetail(msg)}
                    className={`cursor-pointer transition-colors ${
                      !msg.is_read
                        ? 'bg-rose-950/15 hover:bg-rose-950/25 font-semibold'
                        : 'hover:bg-slate-800/40 font-normal'
                    }`}
                  >
                    
                    {/* Read / Unread Indicator */}
                    <td className="py-3.5 px-4 text-center">
                      {!msg.is_read ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" title="ยังไม่ได้อ่าน"></span>
                      ) : (
                        <span className="text-[10px] text-slate-500">อ่านแล้ว</span>
                      )}
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{msg.cm_username}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{msg.cm_cel}</p>
                    </td>

                    {/* Service & Price */}
                    <td className="py-3.5 px-4">
                      {msg.service_id ? (
                        <>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-slate-200 line-clamp-1">{msg.service_name}</p>
                            {msg.category_name && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-950 text-sky-400 border border-sky-800/60">
                                {msg.category_name}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-rose-400 font-mono">
                            ฿{msg.service_price?.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/60">
                            <AlertCircle className="w-3 h-3 text-amber-400" />
                            <span>ไม่แน่ใจอาการ / รอประเมิน</span>
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">ยังไม่ระบุบริการ</p>
                        </div>
                      )}
                    </td>

                    {/* Symptoms */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-400 line-clamp-1">{msg.cm_symptom}</p>
                    </td>

                    {/* Technician In-Charge */}
                    <td className="py-3.5 px-4">
                      {msg.technician_name ? (
                        <div className="flex items-center gap-1.5">
                          <span className="p-1 rounded-md bg-sky-950/80 border border-sky-800/60 text-sky-400 shrink-0">
                            <Wrench className="w-3 h-3" />
                          </span>
                          <span className="font-semibold text-slate-200 text-xs whitespace-nowrap">
                            ช่าง {msg.technician_name} {msg.technician_surname || ''}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60 whitespace-nowrap">
                          <UserX className="w-3 h-3 text-slate-500" />
                          <span>ยังไม่มีผู้รับผิดชอบ</span>
                        </span>
                      )}
                    </td>

                    {/* Repair Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          msg.repair_status === 'completed'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/70 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {msg.repair_status === 'completed' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ซ่อมเสร็จแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>รอซ่อม</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleString('th-TH', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openMessageDetail(msg)}
                          title="เปิดดูรายละเอียด"
                          className="p-1.5 rounded-lg text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(msg)}
                          title="ลบข้อความนี้"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MESSAGE DETAIL MODAL (Dark Mode) */}
      {/* ======================================================== */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-5 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-slate-300">
                  Ticket #{selectedMsg.cm_id}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>เปลี่ยนเป็นอ่านแล้ว (Auto-Read)</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ข้อมูลลูกค้า</p>
                <p className="font-bold text-white text-sm">{selectedMsg.cm_username}</p>
                <p className="text-slate-300 flex items-center gap-1.5 pt-1">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                  <a href={`tel:${selectedMsg.cm_cel}`} className="hover:underline font-mono text-sky-400">
                    {selectedMsg.cm_cel}
                  </a>
                </p>
                <p className="text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <a href={`mailto:${selectedMsg.cm_email}`} className="hover:underline text-sky-400">
                    {selectedMsg.cm_email}
                  </a>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">บริการที่แจ้งซ่อม</p>
                {selectedMsg.service_id ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-white text-sm">{selectedMsg.service_name}</p>
                      {selectedMsg.category_name && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-950 text-sky-400 border border-sky-800/60">
                          {selectedMsg.category_name}
                        </span>
                      )}
                    </div>
                    <p className="text-rose-400 font-black text-sm font-mono">฿{selectedMsg.service_price?.toLocaleString()} บาท</p>
                  </>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300">
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>ลูกค้าไม่แน่ใจอาการ (ปรึกษาช่าง)</span>
                    </div>
                    <p className="text-[11px] text-amber-400/80 mt-0.5">
                      * รอช่างระบุบริการที่ซ่อมจริงในแบบฟอร์มด้านล่าง
                    </p>
                  </div>
                )}
                <p className="text-slate-400 text-[11px] flex items-center gap-1 pt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    แจ้งเมื่อ: {new Date(selectedMsg.created_at).toLocaleString('th-TH')}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ช่างผู้รับผิดชอบงาน</p>
                {selectedMsg.technician_name ? (
                  <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/50 text-sky-300">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>ช่าง {selectedMsg.technician_name} {selectedMsg.technician_surname || ''}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">ผู้รับผิดชอบงานซ่อมรายการนี้</p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserX className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>ยังไม่มีผู้รับผิดชอบ</span>
                    </div>
                    <p className="text-[10px] text-amber-400/80 mt-1">
                      สามารถมอบหมายหรือรับงานได้จากฟอร์มด้านล่าง
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Symptom Details */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-300">อาการของสินค้าที่ลูกค้าแจ้งซ่อม:</h4>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-normal">
                {selectedMsg.cm_symptom}
              </div>
            </div>

            {/* Product Image with Lightbox */}
            {selectedMsg.cm_image && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300">รูปภาพสินค้าที่แนบมา (คลิกเพื่อขยาย):</h4>
                <div
                  onClick={() => setLightboxImage({ src: selectedMsg.cm_image!, alt: `อาการเสียของ Ticket #${selectedMsg.cm_id}` })}
                  className="relative group cursor-zoom-in rounded-2xl overflow-hidden border border-slate-800 max-h-52 bg-slate-950 flex items-center justify-center"
                >
                  <img
                    src={selectedMsg.cm_image}
                    alt="Customer equipment"
                    className="max-h-52 object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=300';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs">
                    <ZoomIn className="w-4 h-4" />
                    <span>คลิกเพื่อดูรูปขยาย</span>
                  </div>
                </div>
              </div>
            )}

            {/* Technician Workspace: Status & Comment Form */}
            <form onSubmit={handleUpdateStatus} className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5">
              
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  อัปเดตสถานะการซ่อมและบริการที่ซ่อมจริง
                </h4>
              </div>

              {/* Service Assignment Dropdown for Technician */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-400" />
                    <span>บริการที่ซ่อมจริง (Service):</span>
                  </label>
                  {!updateServiceId && (
                    <span className="text-[11px] text-amber-400 font-medium">
                      * ต้องเลือกบริการก่อนเปลี่ยนเป็น "ซ่อมเสร็จแล้ว"
                    </span>
                  )}
                </div>
                <select
                  value={updateServiceId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setUpdateServiceId(val);
                    if (val) setServiceValidationError('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer ${
                    serviceValidationError && !updateServiceId
                      ? 'border-rose-500 ring-1 ring-rose-500/40'
                      : 'border-slate-800 focus:border-sky-500'
                  }`}
                >
                  <option value="">-- ยังไม่ระบุบริการ (ลูกค้าไม่แน่ใจอาการ / รอประเมิน) --</option>
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
                <p className="text-[10px] text-slate-400">
                  💡 สามารถเลือกหรือเปลี่ยนบริการที่ซ่อมจริงได้เสมอ โดยเฉพาะเคสที่ลูกค้าเลือกไม่แน่ใจอาการ เพื่อให้ระบบดึงราคาไปคำนวณรายรับใน Dashboard
                </p>
              </div>

              {/* Technician Assignment for Admin / Auto-assign info for Technician */}
              {user?.role === 'admin' ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-300 flex items-center gap-1.5">
                      <UserCog className="w-3.5 h-3.5 text-sky-400" />
                      <span>มอบหมายช่างผู้รับผิดชอบ (Technician Assignment):</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-normal">
                      เฉพาะ Admin มอบหมายงาน
                    </span>
                  </div>
                  <select
                    value={updateTechnicianId ?? ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setUpdateTechnicianId(val);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 cursor-pointer"
                  >
                    <option value="">-- ยังไม่มอบหมายช่าง (ยังไม่มีผู้รับผิดชอบ) --</option>
                    {technicians.map((t) => (
                      <option key={t.u_id} value={t.u_id}>
                        ช่าง {t.u_name} {t.u_surname} ({t.cel})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">
                    💡 ผู้ดูแลระบบสามารถมอบหมายช่างเพื่อติดตามงาน หรือเว้นว่างไว้ให้ช่างเป็นผู้กดรับงานเอง
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="text-white">การรับผิดชอบงานของช่าง:</span>
                  </div>
                  {selectedMsg.technician_id === user?.u_id ? (
                    <p className="text-emerald-400 font-medium text-[11px]">
                      ✓ คุณ (ช่าง {user?.u_name} {user?.u_surname}) เป็นผู้รับผิดชอบงานซ่อมรายการนี้อยู่แล้ว
                    </p>
                  ) : !selectedMsg.technician_id ? (
                    <p className="text-amber-300 font-medium text-[11px]">
                      ⚡ รายการนี้ยังไม่มีผู้รับผิดชอบ เมื่อคุณกด "บันทึกสถานะและความเห็น" ระบบจะผูกชื่อของคุณ (ช่าง {user?.u_name} {user?.u_surname}) เป็นผู้รับผิดชอบโดยอัตโนมัติ
                    </p>
                  ) : (
                    <p className="text-slate-300 text-[11px]">
                      ℹ️ รายการนี้เดิมมอบหมายให้ ช่าง {selectedMsg.technician_name} {selectedMsg.technician_surname || ''} (หากคุณกดบันทึก ระบบจะปรับให้คุณเป็นผู้รับผิดชอบล่าสุดทันที)
                    </p>
                  )}
                </div>
              )}

              {/* Status Select */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">สถานะการติดต่อซ่อม:</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="repairStatusDark"
                      value="pending"
                      checked={updateStatus === 'pending'}
                      onChange={() => {
                        setUpdateStatus('pending');
                        setServiceValidationError('');
                      }}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-bold text-amber-400">รอซ่อม (Pending)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer flex-1">
                    <input
                      type="radio"
                      name="repairStatusDark"
                      value="completed"
                      checked={updateStatus === 'completed'}
                      onChange={() => setUpdateStatus('completed')}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-emerald-400">ซ่อมเสร็จแล้ว (Completed)</span>
                  </label>
                </div>
              </div>

              {/* Service Validation Error Alert */}
              {serviceValidationError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{serviceValidationError}</span>
                </div>
              )}

              {/* Comment Field */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-300">ความคิดเห็นของช่าง / บันทึกการซ่อม:</label>
                <textarea
                  rows={3}
                  value={updateComment}
                  onChange={(e) => setUpdateComment(e.target.value)}
                  placeholder="เช่น ทำการเปลี่ยนอะไหล่เรียบร้อย ทดสอบการทำงานปกติ นัดหมายรับเครื่อง..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedMsg)}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบข้อความนี้</span>
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'กำลังบันทึก...' : 'บันทึกสถานะและความเห็น'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL (Dark Mode) */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl animate-modal">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ยืนยันการลบข้อความแจ้งซ่อม?</h3>
              <p className="text-xs text-slate-400 mt-1 font-normal">
                ต้องการลบคำขอของ "{deleteTarget.cm_username}" (Ticket #{deleteTarget.cm_id}) หรือไม่?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteMessage}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Notification */}
      {toastAlert && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-fade">
          <CheckCircle2 className="w-5 h-5 text-emerald-100 shrink-0" />
          <span className="text-xs font-bold">{toastAlert}</span>
          <button
            onClick={() => setToastAlert(null)}
            className="ml-2 text-white/80 hover:text-white cursor-pointer font-bold text-sm"
          >
            ✕
          </button>
        </div>
      )}

    </div>
  );
};
