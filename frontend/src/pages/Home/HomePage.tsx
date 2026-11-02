import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  Laptop,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Wrench,
  ZoomIn,
  Gift,
  Tag,
  Copy,
  Check,
  Percent,
  Flame,
  X,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import type { Service } from '../../types';
import { useService } from '../../context/ServiceContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import heroImage from '../../assets/hero-repair.jpg';
import halloweenBanner from '../../assets/halloween-promo.jpg';

export const HOME_PROMOTION_CONFIG = {
  isActive: true,
  badge: 'SPECIAL PROMOTION DEAL ✨',
  title: 'โปรโมชั่นพิเศษ ลดทันที 20% ทุกรายการซ่อม!',
  subtitle: 'ส่งซ่อมคอมพิวเตอร์ โน้ตบุ๊ก หรือสมาร์ตโฟนวันนี้ รับส่วนลดค่าบริการทันที 20% พร้อมรับฟรีเซ็ตทำความสะอาดอุปกรณ์!',
  code: 'HALLOWEEN20',
  discount: 'ลด 20%',
  freeGift: 'ฟรี! ชุดเซ็ตทำความสะอาดอุปกรณ์ Precision Care Kit',
  extraBenefit: 'ขยายเวลารับประกันงานซ่อมเพิ่มเป็น 120 วัน',
  expiry: 'สิทธิพิเศษเฉพาะลูกค้าที่จองคิวออนไลน์',
  bannerImage: halloweenBanner,
};

export const HomePage: React.FC = () => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Promotion Interactive States
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [promoDismissed, setPromoDismissed] = useState<boolean>(false);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(HOME_PROMOTION_CONFIG.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const { selectService } = useService();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await apiRequest<Service[]>('/services', {
          params: { status: true },
        });
        if (res.success && res.data) {
          setFeaturedServices(res.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load services on home page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const handleSelectService = (service: Service) => {
    selectService(service);
    navigate('/about#contact');
  };

  const categoriesOverview = [
    {
      title: 'คอมพิวเตอร์ตั้งโต๊ะ (PC)',
      subtitle: 'Desktop & Workstation',
      icon: Monitor,
      tag: 'Computer',
      accentBorder: 'hover:border-sky-300',
      subtitleColor: 'text-sky-600',
      iconStyle: 'text-sky-600 bg-sky-50 border-sky-100',
      desc: 'ตรวจเช็คเปิดไม่ติด เมนบอร์ดช็อต ประกอบเครื่อง ล้างเครื่อง ลงระบบ และกู้คืนข้อมูลปลอดภัย',
    },
    {
      title: 'โน้ตบุ๊ก & แล็ปท็อป (Laptop)',
      subtitle: 'MacBook & Gaming Notebook',
      icon: Laptop,
      tag: 'Laptop',
      accentBorder: 'hover:border-indigo-300',
      subtitleColor: 'text-indigo-600',
      iconStyle: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      desc: 'เปลี่ยนจอแตก เปลี่ยนแบตเตอรี่แท้ ซ่อมเมนบอร์ดโดนน้ำ บานพับหัก ระบบระบายความร้อน',
    },
    {
      title: 'สมาร์ตโฟน & แท็บเล็ต (Phone)',
      subtitle: 'iPhone, iPad & Android',
      icon: Smartphone,
      tag: 'Phone',
      accentBorder: 'hover:border-emerald-300',
      subtitleColor: 'text-emerald-600',
      iconStyle: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      desc: 'เปลี่ยนหน้าจอแท้ เปลี่ยนแบตเตอรี่ ซ่อมพอร์ตชาร์จ ลำโพง และงานซ่อมแผงวงจรด่วน',
    },
  ];

  return (
    <div className="bg-[#f8fafc] text-slate-800">
      
      {/* Image Lightbox Modal */}
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="pt-6 pb-10 sm:pt-10 sm:pb-14 lg:pt-14 lg:pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50/90 border border-sky-200/80 text-sky-800 text-[11px] sm:text-xs font-semibold tracking-wide shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>ศูนย์บริการมาตรฐานสูง • ถนอมเครื่องและรักษาข้อมูลปลอดภัย</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.22]">
                คืนชีวิตให้อุปกรณ์ของคุณ <br />
                <span className="text-sky-600">
                  ซ่อมด่วน ตรงจุด ราคาโปร่งใส
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                บริการตรวจเช็คและซ่อมคอมพิวเตอร์ แล็ปท็อป และสมาร์ตโฟน โดยทีมช่างผู้ชำนาญการ เครื่องมือวิเคราะห์ระดับไมโครสโคป อะไหล่แท้มาตรฐาน พร้อมการรับประกันงานซ่อมนาน 90 วัน
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md active:scale-95 transition-all duration-200"
                >
                  <span>เลือกบริการซ่อม (Services)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200/90 shadow-2xs active:scale-95 transition-all duration-200"
                >
                  <span>เกี่ยวกับเรา & ติดต่อส่งซ่อม</span>
                </Link>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-200/70 text-left">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-700 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">ตรวจเช็คฟรี</p>
                    <p className="text-[10px] text-slate-500 truncate">ประเมินราคาก่อน</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">ประกัน 90 วัน</p>
                    <p className="text-[10px] text-slate-500 truncate">มั่นใจในอะไหล่</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-700 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">ซ่อมด่วนรอรับ</p>
                    <p className="text-[10px] text-slate-500 truncate">งานเปลี่ยนชิ้นส่วน</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 border border-slate-200/60">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/80 flex items-center justify-center text-indigo-700 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">ช่างมืออาชีพ</p>
                    <p className="text-[10px] text-slate-500 truncate">ประสบการณ์ 10+ ปี</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative">
              <div
                onClick={() => setLightboxImage({ src: heroImage, alt: 'Fix Please Precision Repair Lab' })}
                className="group relative rounded-2xl sm:rounded-3xl p-2 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 cursor-zoom-in"
              >
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                  <img
                    src={heroImage}
                    alt="Fix Please Electronics Repair Workshop"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                  
                  {/* Floating zoom badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-900/70 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>คลิกเพื่อขยายดูรูป</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/70 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider truncate">Fix Please Precision Lab</p>
                        <p className="text-xs font-bold text-slate-900 truncate">ห้องแล็บมาตรฐาน เครื่องมือทันสมัย</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                        พร้อมรับบริการ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* PROMOTION BANNER */}
      {/* ======================================================== */}
      {HOME_PROMOTION_CONFIG.isActive && !promoDismissed && (
        <section className="py-6 sm:py-8 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-sky-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-sky-500/30 p-4 sm:p-6 lg:p-8 shadow-xl backdrop-blur-md">
              
              {/* Dismiss Button */}
              <button
                onClick={() => setPromoDismissed(true)}
                title="ซ่อนโปรโมชั่นนี้ชั่วคราว"
                className="absolute top-3 right-3 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer z-20"
                aria-label="ปิดแบนเนอร์โปรโมชั่น"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Left: Banner Image */}
                <div className="lg:col-span-5 relative group">
                  <div
                    onClick={() =>
                      setLightboxImage({
                        src: HOME_PROMOTION_CONFIG.bannerImage,
                        alt: HOME_PROMOTION_CONFIG.title,
                      })
                    }
                    className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-sky-500/30 shadow-md aspect-video cursor-zoom-in bg-slate-950"
                  >
                    <img
                      src={HOME_PROMOTION_CONFIG.bannerImage}
                      alt="Promotion Banner"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>{HOME_PROMOTION_CONFIG.discount}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Promotion Details */}
                <div className="lg:col-span-7 space-y-4 text-left">
                  
                  <div className="flex flex-wrap items-center gap-2 pr-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/50 text-sky-300 text-[11px] font-bold tracking-wider uppercase">
                      <Percent className="w-3 h-3" />
                      <span>{HOME_PROMOTION_CONFIG.badge}</span>
                    </span>
                    <span className="text-[11px] text-emerald-300 font-medium">
                      • {HOME_PROMOTION_CONFIG.expiry}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                      {HOME_PROMOTION_CONFIG.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                      {HOME_PROMOTION_CONFIG.subtitle}
                    </p>
                  </div>

                  {/* Perks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center justify-center shrink-0">
                        <Gift className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs">ของแถมพิเศษ</p>
                        <p className="text-[11px] text-slate-400 truncate">{HOME_PROMOTION_CONFIG.freeGift}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="w-7 h-7 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/60 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs">เพิ่มความคุ้มครอง</p>
                        <p className="text-[11px] text-slate-400 truncate">{HOME_PROMOTION_CONFIG.extraBenefit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Box & Action */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <div className="flex items-center justify-between rounded-xl bg-slate-950 border border-sky-500/40 p-1.5 flex-1">
                      <div className="px-2.5 py-0.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-[11px] text-slate-400">โค้ด:</span>
                        <span className="font-mono font-extrabold text-xs sm:text-sm text-emerald-400 tracking-wider">
                          {HOME_PROMOTION_CONFIG.code}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                          copiedCode
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-95'
                        }`}
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกโค้ด</span>
                          </>
                        )}
                      </button>
                    </div>

                    <Link
                      to="/about#contact"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95 transition-all shrink-0"
                    >
                      <span>รับสิทธิ์แจ้งซ่อม</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 2. DEVICE CATEGORIES SHOWCASE */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-14 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-[11px] font-bold tracking-wider uppercase text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/70">
              อุปกรณ์ที่เรารับซ่อม
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2.5">
              รองรับทุกอุปกรณ์อิเล็กทรอนิกส์ยอดนิยม
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal">
              ทีมช่างเฉพาะทางพร้อมสต็อกอะไหล่มาตรฐานสำหรับคอมพิวเตอร์ แล็ปท็อป และสมาร์ตโฟน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {categoriesOverview.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className={`group relative p-5 sm:p-6 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 ${cat.accentBorder} shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cat.iconStyle}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.subtitleColor}`}>
                        {cat.subtitle}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {cat.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/70">
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 group-hover:translate-x-1 transition-all"
                    >
                      <span>ดูบริการในหมวดหมู่นี้</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURED SERVICES PREVIEW */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/70">
                บริการยอดนิยม
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
                บริการซ่อมที่ลูกค้าเลือกใช้บ่อยที่สุด
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              <span>ดูบริการทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-white border border-slate-200/60 p-4 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-xs border border-slate-200">
                          {service.cg_name || 'งานซ่อม'}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs font-mono">
                          ฿{service.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-normal">
                        {service.detail}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0">
                    <button
                      onClick={() => handleSelectService(service)}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 font-bold text-xs border border-sky-200/70 transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span>เลือกบริการนี้เพื่อส่งซ่อม</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FOUR-STEP WORKFLOW */}
      {/* ======================================================== */}
      <section className="py-10 sm:py-14 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-[11px] font-bold tracking-wider uppercase text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/70">
              ขั้นตอนการส่งซ่อม
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2.5">
              ซ่อมง่ายใน 4 ขั้นตอน ตรวจเช็คได้ทุกระยะ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'เลือกบริการ (Services)',
                desc: 'เลือกรายการบริการที่ตรงกับอาการเสียของอุปกรณ์จากหน้าบริการซ่อม',
                color: 'text-sky-700 border-sky-200 bg-sky-50',
              },
              {
                step: '02',
                title: 'กรอกฟอร์ม Contact Us',
                desc: 'ระบุข้อมูลติดต่อและอาการเสียในหน้า About Me เพื่อให้ช่างเตรียมอะไหล่',
                color: 'text-indigo-700 border-indigo-200 bg-indigo-50',
              },
              {
                step: '03',
                title: 'ส่งเครื่องให้ช่างตรวจสอบ',
                desc: 'นำเครื่องมาที่หน้าร้านหรือส่งพัสดุ ช่างตรวจเช็คและยืนยันราคาก่อนเริ่มงาน',
                color: 'text-sky-700 border-sky-200 bg-sky-50',
              },
              {
                step: '04',
                title: 'รับเครื่องพร้อมประกัน',
                desc: 'ทดสอบเครื่องจนพอใจ ชำระค่าบริการ และรับประกันงานซ่อมนาน 90 วัน',
                color: 'text-emerald-700 border-emerald-200 bg-emerald-50',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all duration-200"
              >
                <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold border ${st.color} mb-2.5 font-mono`}>
                  STEP {st.step}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Call To Action Box */}
          <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-slate-900 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg sm:text-xl font-bold">พร้อมปรึกษาอาการเสียและส่งซ่อมแล้วหรือยัง?</h3>
              <p className="text-xs text-slate-400">เลือกบริการที่ต้องการและส่งคำขอได้ทันที ช่างติดต่อกลับภายในเวลาทำการ</p>
            </div>
            <Link
              to="/services"
              className="w-full md:w-auto text-center px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all shrink-0"
            >
              เริ่มต้นเลือกบริการซ่อม
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};
