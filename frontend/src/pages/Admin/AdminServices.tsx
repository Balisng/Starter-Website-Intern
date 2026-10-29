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
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import type { Category, Service } from '../../types';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Form Fields
  const [form, setForm] = useState({
    name: '',
    cg_id: 1,
    detail: '',
    price: 0,
    status: true,
    service_image: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, srvRes] = await Promise.all([
        apiRequest<Category[]>('/categories'),
        apiRequest<Service[]>('/services'), // get all services (both active and inactive)
      ]);
      if (catRes.success && catRes.data) setCategories(catRes.data);
      if (srvRes.success && srvRes.data) setServices(srvRes.data);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

    if (!form.name.trim()) {
      setFormError('กรุณาระบุชื่อบริการ (ต้องมีอย่างน้อย 2 ตัวอักษร)');
      return;
    }
    if (form.name.trim().length < 2) {
      setFormError('ชื่อบริการสั้นเกินไป (ต้องมีอย่างน้อย 2 ตัวอักษร)');
      return;
    }
    if (!form.cg_id || Number(form.cg_id) <= 0) {
      setFormError('กรุณาเลือกหมวดหมู่บริการ');
      return;
    }
    if (form.price === undefined || form.price === null || form.price === ('' as any) || isNaN(Number(form.price))) {
      setFormError('กรุณาระบุราคาบริการเป็นตัวเลข');
      return;
    }
    if (Number(form.price) < 0) {
      setFormError('ราคาบริการต้องไม่ติดลบ (ต้องเป็น 0 บาทขึ้นไป)');
      return;
    }
    if (!form.detail.trim()) {
      setFormError('กรุณาระบุรายละเอียดบริการ (ต้องมีอย่างน้อย 5 ตัวอักษร)');
      return;
    }
    if (form.detail.trim().length < 5) {
      setFormError('รายละเอียดบริการสั้นเกินไป (ต้องมีอย่างน้อย 5 ตัวอักษร)');
      return;
    }
    if (!form.service_image.trim()) {
      setFormError('กรุณาระบุ URL รูปภาพบริการ');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingService) {
        // Update Service (PUT /api/services/:id)
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
          fetchData();
        } else {
          setFormError(res.message || 'แก้ไขบริการไม่สำเร็จ');
        }
      } else {
        // Create Service (POST /api/services)
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
          fetchData();
        } else {
          setFormError(res.message || 'เพิ่มบริการไม่สำเร็จ');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
        setDeleteTarget(null);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบบริการได้');
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
              <Wrench className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              จัดการรายการบริการ (Manage Services)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            เพิ่ม แก้ไข ปรับสถานะเปิด/ปิด และลบรายการบริการซ่อมที่เชื่อมโยงกับ Categories
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มบริการใหม่ (Add Service)</span>
        </button>
      </div>

      {/* Filter and Search Bar (Dark Mode) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-sky-600 text-white shadow-xs font-bold'
                : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ทั้งหมด ({services.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.cg_id}
              onClick={() => setCategoryFilter(c.cg_id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === c.cg_id
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.cg_name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อบริการ..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
          />
        </div>

      </div>

      {/* Services Table (Dark Mode) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">กำลังโหลดรายการบริการ...</div>
        ) : filteredServices.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-normal">ไม่พบบริการที่ตรงกับเงื่อนไข</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">รูปภาพ</th>
                  <th className="py-3 px-4 font-semibold">ชื่อบริการ & รายละเอียด</th>
                  <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                  <th className="py-3 px-4 font-semibold">ราคา (Price)</th>
                  <th className="py-3 px-4 font-semibold">สถานะบริการ</th>
                  <th className="py-3 px-4 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Thumbnail with Lightbox */}
                    <td className="py-3 px-4 w-20">
                      <div
                        onClick={() => setLightboxImage({ src: service.service_image, alt: service.name })}
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

                    {/* Name & Details */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-md">
                      <p className="font-bold text-slate-100 text-sm">{service.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-normal">
                        {service.detail}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-950/70 text-sky-300 border border-sky-800/50">
                        {service.cg_name || 'หมวดหมู่'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-rose-400 text-sm font-mono">
                      ฿{service.price.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
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

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(service)}
                          title="แก้ไขบริการ"
                          className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          title="ลบบริการ"
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
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
      {/* MODAL: ADD / EDIT SERVICE (Dark Mode) */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg p-6 sm:p-7 space-y-5 shadow-2xl animate-modal relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
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
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              
              {/* Service Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">ชื่อบริการ *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="เช่น ซ่อมเมนบอร์ด PC เปิดไม่ติด"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">หมวดหมู่ (เชื่อม Categories) *</label>
                  <select
                    value={form.cg_id}
                    onChange={(e) => setForm({ ...form, cg_id: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Detail */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">รายละเอียดบริการ *</label>
                <textarea
                  rows={3}
                  required
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  placeholder="ระบุขั้นตอนการตรวจเช็ค การรับประกัน และรายละเอียดงาน"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                ></textarea>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300">รูปภาพบริการ (Image URL) *</label>
                <input
                  type="url"
                  required
                  value={form.service_image}
                  onChange={(e) => setForm({ ...form, service_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                />
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="statusToggleDark"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                  className="w-4 h-4 text-sky-500 rounded border-slate-700 bg-slate-950 focus:ring-sky-500"
                />
                <label htmlFor="statusToggleDark" className="font-bold text-slate-300 cursor-pointer">
                  เปิดรับซ่อมบริการนี้ (Status: True)
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'กำลังบันทึก...' : editingService ? 'บันทึกการแก้ไข' : 'เพิ่มบริการ'}
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
              <h3 className="text-base font-bold text-white">ยืนยันการลบบริการ?</h3>
              <p className="text-xs text-slate-400 mt-1 font-normal">
                คุณต้องการลบ "{deleteTarget.name}" หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
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
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
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
