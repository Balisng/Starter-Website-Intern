import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  ZoomIn,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import type { Category, Service } from '../../types';
import { useService } from '../../context/ServiceContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';

export const ServicesPage: React.FC = () => {
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Expandable details state per service card
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const { selectService, selectedService } = useService();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [catRes, srvRes] = await Promise.all([
          apiRequest<Category[]>('/categories'),
          apiRequest<Service[]>('/services', { params: { status: true } }),
        ]);

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (srvRes.success && srvRes.data) {
          setServicesList(srvRes.data);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSelectAndProceed = (service: Service) => {
    selectService(service);
    navigate('/about#contact');
  };

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredServices = servicesList.filter((s) => {
    const matchesCategory =
      selectedCategory === 'all' || s.cg_id === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.cg_name && s.cg_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8 sm:py-12 bg-[#f8fafc] min-h-screen text-slate-800">
      
      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>รายการบริการซ่อมมาตรฐานสูง</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            บริการซ่อมทั้งหมด (Services)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-normal">
            เลือกรายการบริการที่ตรงกับปัญหาของเครื่องคุณ แล้วกดยืนยันเลือกบริการเพื่อนำข้อมูลไปกรอกรายละเอียดการส่งซ่อมในหน้า Contact Us
          </p>
        </div>

        {/* Selected Service Banner */}
        {selectedService && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">บริการที่คุณเลือกอยู่ขณะนี้</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {selectedService.name} <span className="text-emerald-700 font-mono">(฿{selectedService.price.toLocaleString()})</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/about#contact')}
              className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>ไปที่ฟอร์มแจ้งซ่อม Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-8">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              ทั้งหมด ({servicesList.length})
            </button>
            {categories.map((cat) => {
              const count = servicesList.filter((s) => s.cg_id === cat.cg_id).length;
              return (
                <button
                  key={cat.cg_id}
                  onClick={() => setSelectedCategory(cat.cg_id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat.cg_id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat.cg_name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาบริการซ่อม..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs transition-all"
            />
          </div>

        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200/60 p-4 animate-pulse space-y-4">
                <div className="aspect-video rounded-xl bg-slate-100"></div>
                <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-3 w-full bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-6">
            <ShieldAlert className="w-9 h-9 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">ไม่พบบริการที่คุณค้นหา</h3>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูรายการบริการที่มี
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              const isExpanded = !!expandedCards[service.id];

              return (
                <div
                  key={service.id}
                  className={`group bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Service Image */}
                    <div
                      onClick={() => setLightboxImage({ src: service.service_image, alt: service.name })}
                      className="relative aspect-video overflow-hidden bg-slate-100 cursor-zoom-in"
                    >
                      <img
                        src={service.service_image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600';
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-2xs border border-slate-200">
                          {service.cg_name || 'หมวดหมู่ทั่วไป'}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs font-mono">
                          ฿{service.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-slate-900/60 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" />
                        <span>ขยายรูป</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>เปิดรับซ่อมปกติ • รับประกัน 90 วัน</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {service.name}
                      </h3>

                      <p className={`text-xs text-slate-500 leading-relaxed font-normal ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {service.detail}
                      </p>

                      {service.detail.length > 80 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(service.id)}
                          className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer pt-0.5"
                        >
                          <span>{isExpanded ? 'ย่อรายละเอียด' : 'อ่านรายละเอียดเพิ่มเติม'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => handleSelectAndProceed(service)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                          : 'bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200/70 hover:border-transparent'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>เลือกบริการนี้แล้ว - ไปกรอก Contact Us</span>
                        </>
                      ) : (
                        <>
                          <span>เลือกบริการนี้เพื่อส่งซ่อม</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
