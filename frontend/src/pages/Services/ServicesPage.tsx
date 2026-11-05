import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  ArrowRight,
  Monitor,
  Laptop,
  Smartphone,
  Layers,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';
import type { Service } from '../../types';
import { useService } from '../../context/ServiceContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const ServicesPage: React.FC = () => {
  const {
    categories,
    services,
    catalogLoading,
    refreshCatalog,
    selectService,
    showToast,
  } = useService();

  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [flashKey, setFlashKey] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCatalog(true);
    setRefreshing(false);
    setFlashKey((prev) => prev + 1);
    showToast('อัปเดตข้อมูลรายการบริการล่าสุดเรียบร้อยแล้ว');
  };

  // ส่วนที่ 1: รายการที่กรองได้ตามหมวดหมู่และคำค้นหา (ของเดิม)
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchCat = selectedCategory === 'all' || service.cg_id === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.detail.toLowerCase().includes(q) ||
        (service.cg_name || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleSelectForRepair = (service: Service) => {
    selectService(service);
    showToast(`เลือกบริการ "${service.name}" แล้ว กรอกข้อมูลเพื่อส่งซ่อมได้เลย`);
    navigate('/about#contact');
  };

  const getCategoryIcon = (cgName: string) => {
    const lower = cgName.toLowerCase();
    if (lower.includes('computer') || lower.includes('pc')) return Monitor;
    if (lower.includes('laptop') || lower.includes('notebook')) return Laptop;
    if (lower.includes('phone') || lower.includes('mobile')) return Smartphone;
    return Wrench;
  };

  const getCategoryLabelThai = (cgName: string) => {
    const lower = cgName.toLowerCase();
    if (lower.includes('computer') || lower.includes('pc')) return 'คอมพิวเตอร์ตั้งโต๊ะ (Computer / PC)';
    if (lower.includes('laptop') || lower.includes('notebook')) return 'โน้ตบุ๊กและแล็ปท็อป (Laptop)';
    if (lower.includes('phone') || lower.includes('mobile')) return 'สมาร์ตโฟนและแท็บเล็ต (Phone)';
    return cgName;
  };

  // Compact & Responsive Service Card Component (แสดง 2 คอลัมน์บนมือถือ เห็น 2-4 รายการต่อหน้าจออย่างสวยงาม)
  const renderServiceCard = (service: Service, keyPrefix: string) => (
    <div
      key={`${keyPrefix}-${service.id}`}
      className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
    >
      <div>
        {/* Image Header */}
        <div
          onClick={() => setLightboxImage({ src: service.service_image, alt: service.name })}
          className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-zoom-in"
        >
          <img
            src={service.service_image}
            alt={service.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600';
            }}
          />

          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5">
            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-white/95 text-slate-800 text-[9px] sm:text-[10px] font-bold border border-slate-200">
              {service.cg_name || 'บริการซ่อม'}
            </span>
          </div>

          <div className="hidden sm:flex absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/75 text-white text-[10px] items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3 h-3" />
            <span>ขยายรูป</span>
          </div>

          <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5">
            <span className="px-1.5 sm:px-2.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] sm:text-xs font-bold font-mono shadow-2xs">
              ฿{service.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-2.5 sm:p-4 space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {service.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 leading-snug sm:leading-relaxed line-clamp-2 text-pretty">
            {service.detail}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-2.5 sm:p-4 pt-0">
        <button
          onClick={() => handleSelectForRepair(service)}
          className="w-full py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-lg sm:rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <span className="truncate">เลือกบริการนี้</span>
          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="py-6 sm:py-10 bg-[#f8fafc] min-h-screen">
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              รายการบริการและอัตราค่าซ่อมมาตรฐาน
            </p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              เลือกบริการซ่อมที่ตรงกับอาการอุปกรณ์ของคุณ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl text-pretty">
              <span className="inline-block">แสดงราคาประเมินชัดเจนทุกรายการ</span>{' '}
              <span className="inline-block">รวมค่าแรงช่างและอะไหล่มาตรฐาน</span>{' '}
              <span className="inline-block">สามารถกดเลือกบริการเพื่อส่งข้อมูลให้ช่างตรวจสอบได้ทันที</span>
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'กำลังอัปเดต...' : 'รีเฟรชรายการ'}</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* ส่วนที่ 1: ระบบค้นหาและกรองรายการบริการ (Filterable Section เดิม) */}
        {/* ================================================================= */}
        <section
          key={flashKey}
          className={`space-y-4 sm:space-y-5 rounded-2xl ${
            flashKey > 0 ? 'animate-refresh-flash' : ''
          }`}
        >
          {/* Filter & Search Bar */}
          <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ทั้งหมด ({services.length})</span>
              </button>

              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.cg_name);
                const active = selectedCategory === cat.cg_id;
                const count = services.filter((s) => s.cg_id === cat.cg_id).length;
                return (
                  <button
                    key={cat.cg_id}
                    onClick={() => setSelectedCategory(cat.cg_id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                      active
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>
                      {cat.cg_name} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อบริการ หรืออาการเสีย..."
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Filterable Services Grid (2 cols on mobile, 3 on md, 4 on lg) */}
          {catalogLoading && services.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="h-52 sm:h-64 rounded-xl bg-white border border-slate-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center max-w-md mx-auto space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">ไม่พบรายการบริการที่ค้นหา</h3>
              <p className="text-xs text-slate-500 text-pretty">
                ลองเปลี่ยนหมวดหมู่หรือค้นหาด้วยคำอื่น หรือดูรายการแยกตามหมวดหมู่ด้านล่าง
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                แสดงรายการทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredServices.map((service) => renderServiceCard(service, 'filtered'))}
            </div>
          )}
        </section>

        {/* ================================================================= */}
        {/* ส่วนที่ 2: กรอบแยกตามชนิดหมวดหมู่ (Static Category Showcase Boxes) */}
        {/* แสดงรายการทั้งหมดของแต่ละชนิดโดยไม่ถูกกระทบจากตัวกรองด้านบน */}
        {/* ================================================================= */}
        {categories.length > 0 && (
          <section className="space-y-6 pt-4 border-t border-slate-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                คลังบริการแยกตามประเภทอุปกรณ์
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                รายการบริการทั้งหมดแยกตามหมวดหมู่ ({categories.length} หมวดหมู่)
              </h2>
              <p className="text-xs text-slate-500 text-pretty">
                <span className="inline-block">แสดงรายการซ่อมทั้งหมดของแต่ละประเภทอุปกรณ์</span>{' '}
                <span className="inline-block">เพื่อให้เปรียบเทียบราคาในหมวดเดียวกันได้สะดวก</span>
              </p>
            </div>

            <div className="space-y-5">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.cg_name);
                const categoryServices = services.filter((s) => s.cg_id === cat.cg_id);

                return (
                  <div
                    key={cat.cg_id}
                    className="rounded-2xl bg-white border border-slate-200 p-3.5 sm:p-6 space-y-4"
                  >
                    {/* Category Box Header */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                            {getCategoryLabelThai(cat.cg_name)}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            รวมรายการซ่อมในหมวด {cat.cg_name} ทั้งหมด
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold shrink-0">
                        {categoryServices.length} รายการ
                      </span>
                    </div>

                    {/* Category Services Grid (Static - Unaffected by top filter) */}
                    {categoryServices.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        ยังไม่มีรายการบริการในหมวดหมู่นี้
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                        {categoryServices.map((service) =>
                          renderServiceCard(service, `catbox-${cat.cg_id}`)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
