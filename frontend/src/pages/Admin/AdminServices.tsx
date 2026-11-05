import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useService } from '../../context/ServiceContext';
import type { Category, Service } from '../../types';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const AdminServices: React.FC = () => {
  const { refreshCatalog, showToast } = useService();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [flashKey, setFlashKey] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [form, setForm] = useState({
    name: '',
    cg_id: 1,
    detail: '',
    price: 0,
    status: true,
    service_image: '',
  });

  const fetchData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [catRes, srvRes] = await Promise.all([
        apiRequest<Category[]>('/categories', { params: { fresh: 1 } }),
        apiRequest<Service[]>('/services', { params: { fresh: 1 } }),
      ]);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (srvRes.success && srvRes.data) setServices(srvRes.data);

      if (isManualRefresh) {
        setFlashKey((prev) => prev + 1);
        await refreshCatalog(true);
        showToast('รีเฟรชข้อมูลรายการบริการล่าสุดเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Error loading services:', err);
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

  const openAddModal = () => {
    setEditingService(null);
    setForm({
      name: '',
      cg_id: categories[0]?.cg_id || 1,
      detail: '',
      price: 1000,
      status: true,
      service_image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      cg_id: service.cg_id,
      detail: service.detail,
      price: service.price,
      status: service.status,
      service_image: service.service_image,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.name.trim() || form.name.trim().length < 2) {
      setFormError('กรุณาระบุชื่อบริการ (ต้องมีอย่างน้อย 2 ตัวอักษร)');
      return;
    }
    if (!form.cg_id || Number(form.cg_id) <= 0) {
      setFormError('กรุณาเลือกหมวดหมู่บริการ');
      return;
    }
    if (
      form.price === undefined ||
      form.price === null ||
      form.price === ('' as any) ||
      isNaN(Number(form.price))
    ) {
      setFormError('กรุณาระบุราคาบริการเป็นตัวเลข');
      return;
    }
    if (Number(form.price) < 0) {
      setFormError('ราคาบริการต้องไม่ติดลบ (ต้องเป็น 0 บาทขึ้นไป)');
      return;
    }
    if (!form.detail.trim() || form.detail.trim().length < 5) {
      setFormError('กรุณาระบุรายละเอียดบริการ (ต้องมีอย่างน้อย 5 ตัวอักษร)');
      return;
    }
    if (!form.service_image.trim()) {
      setFormError('กรุณาระบุ URL รูปภาพบริการ');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingService) {
        const res = await apiRequest(`/services/${editingService.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            cg_id: Number(form.cg_id),
          }),
        });
        if (res.success) {
          setModalOpen(false);
          showToast(`แก้ไขบริการ "${form.name.trim()}" เรียบร้อยแล้ว`);
          await fetchData(false);
          await refreshCatalog(true);
        } else {
          setFormError(res.message || 'แก้ไขบริการไม่สำเร็จ');
        }
      } else {
        const res = await apiRequest('/services', {
          method: 'POST',
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            cg_id: Number(form.cg_id),
          }),
        });
        if (res.success) {
          setModalOpen(false);
          showToast(`เพิ่มบริการใหม่ "${form.name.trim()}" เรียบร้อยแล้ว`);
          await fetchData(false);
          await refreshCatalog(true);
        } else {
          setFormError(res.message || 'เพิ่มบริการไม่สำเร็จ');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await apiRequest(`/services/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast(`ลบบริการ "${deleteTarget.name}" เรียบร้อยแล้ว`);
        setDeleteTarget(null);
        await fetchData(false);
        await refreshCatalog(true);
      }
    } catch (err: any) {
      showToast(err.message || 'ไม่สามารถลบบริการได้', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchCat = categoryFilter === 'all' || s.cg_id === categoryFilter;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.detail.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
              <Wrench className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              จัดการรายการบริการและราคาซ่อม
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            เพิ่ม แก้ไข ปรับสถานะเปิด/ปิด และลบรายการบริการซ่อมในแต่ละหมวดหมู่
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบริการใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ทั้งหมด ({services.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.cg_id}
              onClick={() => setCategoryFilter(c.cg_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                categoryFilter === c.cg_id
                  ? 'bg-sky-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.cg_name}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อบริการ..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Services List */}
      <div
        key={flashKey}
        className={`rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden ${
          flashKey > 0 ? 'animate-refresh-flash' : ''
        }`}
      >
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">กำลังโหลดรายการบริการ...</div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            ไม่พบรายการบริการที่ตรงกับเงื่อนไข
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800">
              {filteredServices.map((service) => (
                <div key={service.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      onClick={() =>
                        setLightboxImage({ src: service.service_image, alt: service.name })
                      }
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0 cursor-zoom-in"
                    >
                      <img
                        src={service.service_image}
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
                          {service.cg_name || 'หมวดหมู่'}
                        </span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          ฿{service.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="font-bold text-slate-100 text-sm leading-snug">{service.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{service.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    {service.status ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>เปิดรับซ่อม</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <XCircle className="w-3 h-3 text-slate-500" />
                        <span>ปิดบริการ</span>
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(service)}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">รูปภาพ</th>
                    <th className="py-3 px-4 font-semibold">ชื่อบริการ & รายละเอียด</th>
                    <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                    <th className="py-3 px-4 font-semibold">ราคาประเมิน</th>
                    <th className="py-3 px-4 font-semibold">สถานะบริการ</th>
                    <th className="py-3 px-4 font-semibold text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 w-20">
                        <div
                          onClick={() =>
                            setLightboxImage({ src: service.service_image, alt: service.name })
                          }
                          className="relative group cursor-zoom-in w-14 h-14 rounded-xl overflow-hidden border border-slate-800 bg-slate-950"
                        >
                          <img
                            src={service.service_image}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs lg:max-w-md">
                        <p className="font-bold text-slate-100 text-sm">{service.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {service.detail}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/60 whitespace-nowrap">
                          {service.cg_name || 'หมวดหมู่'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-400 text-sm font-mono whitespace-nowrap">
                        ฿{service.price.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {service.status ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>เปิดรับซ่อม</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="w-3 h-3 text-slate-500" />
                            <span>ปิดบริการ</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(service)}
                            title="แก้ไขบริการ"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(service)}
                            title="ลบบริการ"
                            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
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
          </>
        )}
      </div>

      {/* MODAL: ADD / EDIT SERVICE (Click outside to close) */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {editingService ? 'แก้ไขรายการบริการ' : 'เพิ่มรายการบริการใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">ชื่อบริการ *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="เช่น ซ่อมเมนบอร์ด PC เปิดไม่ติด"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">หมวดหมู่บริการ *</label>
                  <select
                    value={form.cg_id}
                    onChange={(e) => setForm({ ...form, cg_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {categories.map((c) => (
                      <option key={c.cg_id} value={c.cg_id} className="bg-slate-900 text-slate-100">
                        {c.cg_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">ราคาบริการ (บาท) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">รายละเอียดบริการ *</label>
                <textarea
                  rows={3}
                  required
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  placeholder="ระบุขั้นตอนการตรวจเช็ค การรับประกัน และรายละเอียดงาน"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">ลิงก์รูปภาพบริการ (Image URL) *</label>
                <input
                  type="url"
                  required
                  value={form.service_image}
                  onChange={(e) => setForm({ ...form, service_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="statusToggleDark"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                  className="w-4 h-4 text-sky-500 rounded border-slate-700 bg-slate-950 focus:ring-sky-500"
                />
                <label htmlFor="statusToggleDark" className="font-bold text-slate-300 cursor-pointer">
                  เปิดรับซ่อมบริการนี้บนหน้าเว็บไซต์
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting
                    ? 'กำลังบันทึก...'
                    : editingService
                    ? 'บันทึกการแก้ไข'
                    : 'เพิ่มบริการ'}
                </button>
              </div>
            </form>
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
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl animate-modal"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/70 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ยืนยันการลบบริการ?</h3>
              <p className="text-xs text-slate-400 mt-1">
                คุณต้องการลบบริการ "{deleteTarget.name}" หรือไม่?
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
                onClick={handleDelete}
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
