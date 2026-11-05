import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  Laptop,
  Smartphone,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Wrench,
  ZoomIn,
  Gift,
  Tag,
  Copy,
  Check,
  Percent,
  X,
} from 'lucide-react';
import type { Service } from '../../types';
import { useService } from '../../context/ServiceContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import heroImage from '../../assets/hero-repair.jpg';
import halloweenBanner from '../../assets/halloween-promo.jpg';

export const HOME_PROMOTION_CONFIG = {
  isActive: true,
  badge: 'โปรโมชั่นประจำเดือน',
  title: 'ลดค่าบริการทันที 20% ทุกรายการซ่อม',
  subtitle:
    'ส่งซ่อมคอมพิวเตอร์ โน้ตบุ๊ก หรือสมาร์ตโฟนวันนี้ รับส่วนลดค่าแรงและอะไหล่ทันที 20% พร้อมบริการทำความสะอาดเครื่องฟรี',
  code: 'HALLOWEEN20',
  discount: 'ส่วนลด 20%',
  freeGift: 'ฟรี บริการทำความสะอาดเครื่องและทาซิลิโคนระบายความร้อน',
  extraBenefit: 'ขยายเวลารับประกันงานซ่อมเพิ่มเป็น 120 วัน',
  expiry: 'สำหรับลูกค้าที่ลงทะเบียนแจ้งซ่อมผ่านหน้าเว็บไซต์',
  bannerImage: halloweenBanner,
};

export const HomePage: React.FC = () => {
  const { services, catalogLoading, selectService, showToast } = useService();
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [promoDismissed, setPromoDismissed] = useState<boolean>(false);

  const navigate = useNavigate();
  const featuredServices = services.slice(0, 4);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(HOME_PROMOTION_CONFIG.code);
      setCopiedCode(true);
      showToast(`คัดลอกโค้ดส่วนลด ${HOME_PROMOTION_CONFIG.code} เรียบร้อยแล้ว`);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleSelectService = (service: Service) => {
    selectService(service);
    showToast(`เลือกบริการ "${service.name}" แล้ว กรอกข้อมูลเพื่อส่งซ่อมได้เลย`);
    navigate('/about#contact');
  };

  const categoriesOverview = [
    {
      title: 'คอมพิวเตอร์ตั้งโต๊ะ',
      subtitle: 'PC & Workstation',
      icon: Monitor,
      accentBorder: 'hover:border-sky-300',
      subtitleColor: 'text-sky-700',
      iconStyle: 'text-sky-700 bg-sky-50 border-sky-200/70',
      phrases: [
        'ตรวจเช็คอาการเปิดไม่ติด',
        'ซ่อมเมนบอร์ดและการ์ดจอ',
        'อัปเกรดชุดระบายความร้อน',
        'และกู้คืนข้อมูลสำคัญอย่างปลอดภัย',
      ],
    },
    {
      title: 'โน้ตบุ๊กและแล็ปท็อป',
      subtitle: 'Notebook & MacBook',
      icon: Laptop,
      accentBorder: 'hover:border-indigo-300',
      subtitleColor: 'text-indigo-700',
      iconStyle: 'text-indigo-700 bg-indigo-50 border-indigo-200/70',
      phrases: [
        'เปลี่ยนหน้าจอและแบตเตอรี่แท้',
        'ซ่อมแผงวงจรกรณีเครื่องโดนน้ำ',
        'ซ่อมบานพับแตกหัก',
        'และล้างฝุ่นทำความสะอาดภายใน',
      ],
    },
    {
      title: 'สมาร์ตโฟนและแท็บเล็ต',
      subtitle: 'iPhone, iPad & Android',
      icon: Smartphone,
      accentBorder: 'hover:border-emerald-300',
      subtitleColor: 'text-emerald-700',
      iconStyle: 'text-emerald-700 bg-emerald-50 border-emerald-200/70',
      phrases: [
        'เปลี่ยนจอแสดงผลและกระจกทัชสกรีน',
        'เปลี่ยนแบตเตอรี่มาตรฐาน มอก.',
        'ซ่อมตูดชาร์จ ลำโพง ไมโครโฟน',
        'และแก้ไขอาการเครื่องค้างเปิดไม่ติด',
      ],
    },
  ];

  return (
    <div className="bg-[#f8fafc] text-slate-800">
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* 1. HERO SECTION */}
      <section className="pt-6 pb-10 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>ศูนย์ซ่อมมาตรฐาน • แจ้งราคาก่อนซ่อมทุกครั้ง</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.25] text-balance">
                <span className="inline-block">ดูแลและซ่อมอุปกรณ์ไอทีของคุณ</span>{' '}
                <span className="text-sky-600 inline-block">ตรงจุด รวดเร็ว ราคาชัดเจน</span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
                <span className="inline-block">บริการตรวจเช็คและซ่อมคอมพิวเตอร์ โน้ตบุ๊ก</span>{' '}
                <span className="inline-block">และสมาร์ตโฟนโดยทีมช่างผู้ชำนาญการ</span>{' '}
                <span className="inline-block">วิเคราะห์อาการด้วยเครื่องมือมาตรฐาน</span>{' '}
                <span className="inline-block">ใช้อะไหล่คุณภาพสูง</span>{' '}
                <span className="inline-block">พร้อมรับประกันงานซ่อมทุกชิ้นนาน 90 วัน</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors"
                >
                  <span>ดูรายการบริการและราคา</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/about#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 transition-colors"
                >
                  <span>ส่งเรื่องแจ้งซ่อม / ปรึกษาช่าง</span>
                </Link>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-200 text-left">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-700 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">ตรวจเช็คฟรี</p>
                    <p className="text-[11px] text-slate-500">แจ้งราคาก่อนซ่อม</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">ประกัน 90 วัน</p>
                    <p className="text-[11px] text-slate-500">ดูแลหลังการซ่อม</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-sky-100/80 flex items-center justify-center text-sky-700 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">ซ่อมด่วนรอรับ</p>
                    <p className="text-[11px] text-slate-500">สำหรับงานเปลี่ยนอะไหล่</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100/80 flex items-center justify-center text-indigo-700 shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900">ช่างเฉพาะทาง</p>
                    <p className="text-[11px] text-slate-500">ประสบการณ์กว่า 10 ปี</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5">
              <div
                onClick={() =>
                  setLightboxImage({ src: heroImage, alt: 'ห้องปฏิบัติการงานซ่อม FixPlease' })
                }
                className="group relative rounded-2xl p-2 bg-slate-50 border border-slate-200 cursor-zoom-in"
              >
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100">
                  <img
                    src={heroImage}
                    alt="ห้องปฏิบัติการงานซ่อม FixPlease"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/75 text-white text-[11px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>ดูรูปขนาดใหญ่</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 border border-slate-200">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                          FixPlease Workshop
                        </p>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          ห้องซ่อมมาตรฐาน ปลอดไฟฟ้าสถิตและปลอดภัยต่อข้อมูล
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                        เปิดให้บริการ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTION BANNER */}
      {HOME_PROMOTION_CONFIG.isActive && !promoDismissed && (
        <section className="py-6 sm:py-8 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6">
              <button
                onClick={() => {
                  setPromoDismissed(true);
                  showToast('ซ่อนแบนเนอร์โปรโมชั่นชั่วคราวแล้ว', 'info');
                }}
                title="ซ่อนโปรโมชั่นนี้"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer z-20"
                aria-label="ปิดแบนเนอร์โปรโมชั่น"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                {/* Left: Banner Image */}
                <div className="lg:col-span-4">
                  <div
                    onClick={() =>
                      setLightboxImage({
                        src: HOME_PROMOTION_CONFIG.bannerImage,
                        alt: HOME_PROMOTION_CONFIG.title,
                      })
                    }
                    className="relative rounded-xl overflow-hidden border border-slate-800 aspect-video cursor-zoom-in bg-slate-900"
                  >
                    <img
                      src={HOME_PROMOTION_CONFIG.bannerImage}
                      alt="แบนเนอร์โปรโมชั่น"
                      className="w-full h-full object-cover hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold">
                      {HOME_PROMOTION_CONFIG.discount}
                    </div>
                  </div>
                </div>

                {/* Right: Promotion Details */}
                <div className="lg:col-span-8 space-y-3.5 text-left">
                  <div className="flex flex-wrap items-center gap-2 pr-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-950 border border-sky-800 text-sky-300 text-[11px] font-bold">
                      <Percent className="w-3 h-3" />
                      <span>{HOME_PROMOTION_CONFIG.badge}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • {HOME_PROMOTION_CONFIG.expiry}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white">
                      {HOME_PROMOTION_CONFIG.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed text-pretty">
                      <span className="inline-block">ส่งซ่อมคอมพิวเตอร์ โน้ตบุ๊ก หรือสมาร์ตโฟนวันนี้</span>{' '}
                      <span className="inline-block">รับส่วนลดค่าแรงและอะไหล่ทันที 20%</span>{' '}
                      <span className="inline-block">พร้อมบริการทำความสะอาดเครื่องฟรี</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-200 text-[11px] sm:text-xs">
                        {HOME_PROMOTION_CONFIG.freeGift}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="text-slate-200 text-[11px] sm:text-xs">
                        {HOME_PROMOTION_CONFIG.extraBenefit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-700 p-1.5 flex-1">
                      <div className="px-2.5 py-0.5 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-xs text-slate-400">โค้ดส่วนลด:</span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 tracking-wider">
                          {HOME_PROMOTION_CONFIG.code}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                          copiedCode
                            ? 'bg-emerald-600 text-white'
                            : 'bg-sky-600 hover:bg-sky-500 text-white'
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
                      to={`/about?promo=${HOME_PROMOTION_CONFIG.code}#contact`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0"
                    >
                      <span>ใช้สิทธิ์แจ้งซ่อม</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. DEVICE CATEGORIES SHOWCASE */}
      <section className="py-10 sm:py-12 bg-[#f8fafc] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-7">
            <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              ขอบเขตงานบริการ
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              รับซ่อมอุปกรณ์อิเล็กทรอนิกส์ครบทั้ง 3 หมวดหลัก
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 text-pretty">
              <span className="inline-block">แยกทีมช่างเฉพาะทางตามประเภทอุปกรณ์</span>{' '}
              <span className="inline-block">พร้อมสต็อกอะไหล่แท้สำหรับรุ่นยอดนิยม</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {categoriesOverview.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl bg-white border border-slate-200 ${cat.accentBorder} transition-colors flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cat.iconStyle}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${cat.subtitleColor}`}
                      >
                        {cat.subtitle}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{cat.title}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed text-pretty">
                      {cat.phrases.map((phrase, i) => (
                        <React.Fragment key={i}>
                          <span className="inline-block">{phrase}</span>
                          {i < cat.phrases.length - 1 ? ' ' : ''}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-sky-600 transition-colors"
                    >
                      <span>ดูรายการซ่อมในหมวดนี้</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED SERVICES PREVIEW (2 columns on mobile so 2-4 items fit comfortably) */}
      <section className="py-10 sm:py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                รายการยอดนิยม
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                บริการซ่อมที่ลูกค้าใช้บริการบ่อย
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              <span>ดูรายการบริการทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {catalogLoading && featuredServices.length === 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-56 sm:h-64 rounded-xl bg-slate-100 border border-slate-200 animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() =>
                        setLightboxImage({ src: service.service_image, alt: service.name })
                      }
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
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-800 border border-slate-200">
                          {service.cg_name || 'งานซ่อม'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-bold bg-slate-900/90 text-emerald-400 font-mono">
                          ฿{service.price.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-1.5">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 text-pretty">
                        {service.detail}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 pt-0">
                    <button
                      onClick={() => handleSelectService(service)}
                      className="w-full py-2 px-3 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-[11px] sm:text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>เลือกบริการนี้</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. FOUR-STEP WORKFLOW */}
      <section className="py-10 sm:py-12 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-7">
            <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              ขั้นตอนการรับบริการ
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              ส่งซ่อมง่ายใน 4 ขั้นตอน
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                step: '01',
                title: 'เลือกรายการซ่อม',
                desc: 'ตรวจสอบรายการซ่อมและราคาประเมินเบื้องต้นจากหน้ารายการบริการ',
              },
              {
                step: '02',
                title: 'แจ้งอาการออนไลน์',
                desc: 'กรอกข้อมูลติดต่อและอาการเสียเพื่อให้ช่างเตรียมอะไหล่ไว้รองรับ',
              },
              {
                step: '03',
                title: 'ตรวจเช็คและยืนยันราคา',
                desc: 'ช่างตรวจสอบเครื่องจริงและแจ้งราคาสุทธิให้ลูกค้าอนุมัติก่อนลงมือซ่อม',
              },
              {
                step: '04',
                title: 'รับเครื่องพร้อมใบรับประกัน',
                desc: 'ตรวจสอบความเรียบร้อย ชำระค่าบริการ และรับประกันงานซ่อม 90 วัน',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200"
              >
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold font-mono mb-2">
                  ขั้นตอนที่ {st.step}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{st.title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed text-pretty">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
