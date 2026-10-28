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

  // Micro-interaction: Expandable details state per service card
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
    // ตาม Requirement: ส่งซ่อมผ่านการเลือก/ยืนยันจากหน้า Services เท่านั้น แล้วไปหน้า About me ในหัวข้อ Contact Us
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
    <div className="py-10 sm:py-14 bg-[#f8fafc] min-h-screen text-slate-800">
      
      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>รายการบริการซ่อมมาตรฐานสูง</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            บริการซ่อมทั้งหมด (Services)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-normal">
            เลือกรายการบริการที่ตรงกับปัญหาของเครื่องคุณ แล้วกดยืนยันเลือกบริการเพื่อนำข้อมูลไปกรอกรายละเอียดการส่งซ่อมในหน้า Contact Us
          </p>
        </div>

        {/* Selected Service Banner */}
        {selectedService && (
          <div className="mb-8 p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[11px] text-sky-700 font-bold uppercase tracking-wider">บริการที่คุณเลือกอยู่ขณะนี้</p>
                <p className="text-sm font-bold text-slate-900">{selectedService.name} (฿{selectedService.price.toLocaleString()})</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/about#contact')}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>ไปที่ฟอร์มแจ้งซ่อม Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
          <div className="relative w-full md:w-80">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-white border border-slate-200/60 p-4 animate-pulse space-y-4">
                <div className="aspect-video rounded-2xl bg-slate-100"></div>
                <div className="h-5 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-4 w-full bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8">
            <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">ไม่พบบริการที่คุณค้นหา</h3>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              const isExpanded = !!expandedCards[service.id];

              return (
                <div
                  key={service.id}
                  className={`group bg-white rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md hover:-translate-y-1.5 ${
                    isSelected
                      ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Service Image with Zoom on Hover and Click Lightbox */}
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
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-2xs border border-slate-200">
                          {service.cg_name || 'หมวดหมู่ทั่วไป'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-white shadow-2xs">
                          ฿{service.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-slate-900/60 text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <ZoomIn className="w-3 h-3" />
                        <span>ขยายรูป</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>เปิดรับซ่อมปกติ • รับประกัน 90 วัน</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {service.name}
                      </h3>

                      {/* Detail with Expandable Feature */}
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
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleSelectAndProceed(service)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-xs hover:bg-rose-700'
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
