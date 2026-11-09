import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Send,
  Wrench,
  AlertCircle,
  User,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Award,
  ZoomIn,
  X,
  Tag,
  Percent,
  Check,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useService } from '../../context/ServiceContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import workshopImage from '../../assets/hero-repair.jpg';

export const AboutPage: React.FC = () => {
  const {
    selectedService,
    selectService,
    clearSelectedService,
    categories,
    services,
    showToast,
  } = useService();
  const location = useLocation();

  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Contact Form States
  const [serviceId, setServiceId] = useState<number | ''>('');
  const [cmUsername, setCmUsername] = useState('');
  const [cmCel, setCmCel] = useState('');
  const [cmEmail, setCmEmail] = useState('');
  const [cmSymptom, setCmSymptom] = useState('');
  const [cmImage, setCmImage] = useState('');

  // Promotion Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (selectedService) {
      setServiceId(selectedService.id);
    }
  }, [selectedService]);

  useEffect(() => {
    if (location.hash === '#contact') {
      const el = document.getElementById('contact');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location]);

  // ตรวจจับโค้ดโปรโมชั่นจาก URL (เช่น มาจากปุ่มในหน้าแรก /about?promo=HALLOWEEN20#contact)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const promoFromUrl = searchParams.get('promo');
    if (promoFromUrl) {
      const clean = promoFromUrl.trim().toUpperCase();
      if (clean === 'HALLOWEEN20' || clean === 'PROMO20' || clean === 'FIX20') {
        setPromoCodeInput(clean);
        setAppliedPromo('HALLOWEEN20');
        setPromoError('');
        showToast('🎉 ใช้สิทธิ์โค้ดส่วนลด HALLOWEEN20 ลดค่าบริการ 20% ทุกรายการซ่อมแล้ว!');
      }
    }
  }, [location.search]);

  const handleApplyPromo = (codeToTest?: string) => {
    const code = (codeToTest || promoCodeInput).trim().toUpperCase();
    if (!code) {
      setPromoError('กรุณากรอกโค้ดส่วนลด');
      return;
    }
    if (code === 'HALLOWEEN20' || code === 'PROMO20' || code === 'FIX20') {
      setAppliedPromo('HALLOWEEN20');
      setPromoCodeInput('HALLOWEEN20');
      setPromoError('');
      showToast('🎉 ใช้โค้ดส่วนลด HALLOWEEN20 สำเร็จ! ได้รับส่วนลด 20% สำหรับงานซ่อมนี้');
    } else {
      setPromoError('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุ (ลองใช้โค้ด HALLOWEEN20)');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
    showToast('ยกเลิกการใช้โค้ดส่วนลดแล้ว', 'info');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    }
    setCmCel(formatted);
  };

  const handleServiceSelectChange = (val: string) => {
    if (!val) {
      setServiceId('');
      clearSelectedService();
      return;
    }
    const numId = Number(val);
    setServiceId(numId);
    const found = services.find((s) => s.id === numId);
    if (found) {
      selectService(found);
    }
  };

  const currentServiceObj =
    services.find((s) => s.id === Number(serviceId)) || selectedService || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!cmUsername.trim() || cmUsername.trim().length < 2) {
      setErrorMsg('กรุณากรอกชื่อของคุณ (อย่างน้อย 2 ตัวอักษร)');
      return;
    }

    const cleanPhone = cmCel.replace(/\D/g, '');
    if (!cleanPhone) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    if (!/^0[689]\d{8}$/.test(cleanPhone)) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ขึ้นต้นด้วย 06, 08 หรือ 09 ครบ 10 หลัก)');
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|[a-zA-Z0-9-]+\.(com|co\.th|ac\.th|or\.th|go\.th))$/i;
    if (!cmEmail.trim()) {
      setErrorMsg('กรุณากรอกอีเมลสำหรับติดต่อกลับ');
      return;
    }
    if (!emailRegex.test(cmEmail.trim())) {
      setErrorMsg(
        'รูปแบบอีเมลไม่ถูกต้อง (รองรับ @gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com หรือโดเมนมาตรฐาน .com, .co.th, .ac.th)'
      );
      return;
    }

    if (!cmSymptom.trim() || cmSymptom.trim().length < 5) {
      setErrorMsg('กรุณาระบุอาการเสียของอุปกรณ์อย่างน้อย 5 ตัวอักษร');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        service_id: serviceId ? Number(serviceId) : null,
        cm_username: cmUsername.trim(),
        cm_cel: cmCel.trim(),
        cm_email: cmEmail.trim(),
        cm_symptom: cmSymptom.trim(),
        cm_image: cmImage.trim() ? cmImage.trim() : null,
        promo_code: appliedPromo || null,
      };

      const res = await apiRequest('/inbox', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        const msg = appliedPromo
          ? `ส่งข้อมูลแจ้งซ่อมเรียบร้อยแล้ว ได้รับสิทธิ์ส่วนลด 20% (โค้ด: ${appliedPromo}) ช่างจะติดต่อกลับเพื่อยืนยันรายละเอียดโดยเร็ว`
          : (res.message || 'ส่งข้อมูลแจ้งซ่อมเรียบร้อยแล้ว ช่างจะติดต่อกลับเพื่อยืนยันรายละเอียดโดยเร็ว');
        setSuccessMsg(msg);
        showToast('ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว ช่างจะติดต่อกลับโดยเร็ว');
        setCmUsername('');
        setCmCel('');
        setCmEmail('');
        setCmSymptom('');
        setCmImage('');
        setServiceId('');
        setAppliedPromo(null);
        setPromoCodeInput('');
        setPromoError('');
        clearSelectedService();
      } else {
        setErrorMsg(res.message || 'ไม่สามารถส่งข้อความได้ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        showToast(res.message || 'ไม่สามารถส่งข้อมูลได้', 'error');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง';
      setErrorMsg(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#f8fafc] min-h-screen space-y-10 sm:space-y-14">
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      {/* ======================================================== */}
      {/* 1. ABOUT US & STORE INFORMATION (ไม่มีกรอบแผนที่ตาม Requirement) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* Top White Card: Brand Story & Workshop Image */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column: About Narrative */}
            <div className="lg:col-span-7 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-sky-700">
                เกี่ยวกับศูนย์บริการของเรา
              </p>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug text-balance">
                <span className="inline-block">FixPlease ศูนย์ซ่อมอุปกรณ์ไอที</span>{' '}
                <span className="text-sky-600 inline-block">
                  ที่เน้นความโปร่งใสและมาตรฐานงานช่าง
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-pretty">
                <span className="inline-block">เราเป็นศูนย์ซ่อมคอมพิวเตอร์ โน้ตบุ๊ก</span>{' '}
                <span className="inline-block">และสมาร์ตโฟนที่ก่อตั้งโดยทีมช่างเทคนิค</span>{' '}
                <span className="inline-block">ผู้มีประสบการณ์ด้านฮาร์ดแวร์และแผงวงจรกว่า 10 ปี</span>{' '}
                <span className="inline-block">ทุกขั้นตอนตั้งแต่การรับเครื่อง</span>{' '}
                <span className="inline-block">การประเมินราคา ไปจนถึงการส่งมอบงาน</span>{' '}
                <span className="inline-block">ถูกบันทึกอย่างเป็นระบบเพื่อให้ลูกค้าตรวจสอบได้จริง</span>
              </p>

              {/* Key Commitments (Soft Tinted Highlights inside Narrative) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/70">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">รักษาข้อมูลส่วนตัวปลอดภัย</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 text-pretty">
                      มีขั้นตอนสำรองข้อมูลและไม่เข้าถึงไฟล์ส่วนตัวของลูกค้าโดยเด็ดขาด
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">อะไหล่แท้ รับประกัน 90 วัน</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 text-pretty">
                      คัดสรรอะไหล่ตรงรุ่นและทดสอบความเสถียรของเครื่องก่อนส่งมอบทุกครั้ง
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Workshop Image */}
            <div className="lg:col-span-5">
              <div
                onClick={() =>
                  setLightboxImage({
                    src: workshopImage,
                    alt: 'ห้องซ่อมและเครื่องมือตรวจวิเคราะห์ของ FixPlease',
                  })
                }
                className="group relative rounded-xl overflow-hidden border border-slate-200 aspect-[16/10] bg-slate-100 cursor-zoom-in"
              >
                <img
                  src={workshopImage}
                  alt="FixPlease Repair Studio"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent"></div>

                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/75 text-white text-[10px] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3 h-3" />
                  <span>ขยายดูรูป</span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                      ห้องปฏิบัติการงานซ่อม
                    </p>
                    <p className="text-xs font-bold">
                      เครื่องมือตรวจเช็ควงจรและอุปกรณ์มาตรฐานครบครัน
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separate 3-Column Dark Info Strip: Location, Hours & Direct Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                Location
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">ที่ตั้งศูนย์บริการ</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-pretty">
                เลขที่ 99/1 อาคารดิจิทัลพลาซ่า ชั้น 3 ถนนพญาไท เขตราชเทวี กรุงเทพฯ 10400
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Working Hours
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">วันและเวลาทำการ</h3>
              <p className="text-xs text-slate-200 font-medium">
                เปิดบริการทุกวัน: 09:30 – 20:00 น.
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold">
                รับเครื่องด่วนและให้คำปรึกษาตลอดเวลาทำการ
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                Direct Contact
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">เบอร์ติดต่อและอีเมล</h3>
              <p className="text-xs font-bold text-white font-mono">
                081-111-1111, 02-999-8888
              </p>
              <p className="text-[11px] text-sky-300">support@fixplease.co.th</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. IMPROVED CONTACT US / REPAIR REQUEST BOX */}
      {/* ======================================================== */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Panel: Repair Guide & Selected Service Summary */}
          <div className="lg:col-span-4 bg-slate-900 text-white p-5 sm:p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  แบบฟอร์มแจ้งซ่อมและปรึกษาช่าง
                </p>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                  ส่งข้อมูลอาการเสียให้ช่างประเมิน
                </h2>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed text-pretty">
                  <span className="inline-block">กรอกรายละเอียดอาการเสียของเครื่อง</span>{' '}
                  <span className="inline-block">เพื่อให้ช่างตรวจสอบอะไหล่และติดต่อกลับ</span>{' '}
                  <span className="inline-block">หากไม่แน่ใจอาการสามารถเว้นช่องบริการไว้ได้</span>
                </p>
              </div>

              {/* Live Selected Service Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    บริการที่คุณเลือกไว้
                  </span>
                  {currentServiceObj && (
                    <button
                      type="button"
                      onClick={() => {
                        setServiceId('');
                        clearSelectedService();
                        showToast('ยกเลิกการเลือกบริการแล้ว สามารถส่งเป็นแบบปรึกษาช่างได้', 'info');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>ล้างค่า</span>
                    </button>
                  )}
                </div>

                {currentServiceObj ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white leading-snug">
                      {currentServiceObj.name}
                    </p>
                    <div className="space-y-1 text-xs pt-1 border-t border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-sky-400 font-medium">
                          หมวด: {currentServiceObj.cg_name || 'บริการซ่อม'}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            appliedPromo ? 'line-through text-slate-500 text-[11px]' : 'text-emerald-400'
                          }`}
                        >
                          ฿{currentServiceObj.price.toLocaleString()} บาท
                        </span>
                      </div>

                      {appliedPromo && (
                        <>
                          <div className="flex items-center justify-between text-[11px] text-amber-300 font-medium">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-amber-400" />
                              <span>ส่วนลด 20% ({appliedPromo}):</span>
                            </span>
                            <span className="font-mono font-bold">
                              -฿{Math.round(currentServiceObj.price * 0.2).toLocaleString()} บาท
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-1 border-t border-slate-800">
                            <span>ราคาสุทธิหลังหักส่วนลด:</span>
                            <span className="font-mono text-sm">
                              ฿{Math.round(currentServiceObj.price * 0.8).toLocaleString()} บาท
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-amber-300 font-medium">
                      ยังไม่ได้ระบุบริการ (ส่งเรื่องเพื่อให้ช่างช่วยประเมินอาการได้)
                    </p>
                    {appliedPromo && (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        🎉 ใช้สิทธิ์โค้ด {appliedPromo} รับส่วนลด 20% เมื่อช่างประเมินราคา
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Steps List */}
              <div className="space-y-3 pt-1">
                <p className="text-xs font-bold text-slate-200">ขั้นตอนหลังจากส่งฟอร์มนี้:</p>
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span className="text-pretty">
                      ข้อมูลจะถูกส่งเข้าสู่คิวงานซ่อมของช่างประจำศูนย์ทันที
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span className="text-pretty">
                      ช่างติดต่อกลับตามเบอร์โทรศัพท์หรืออีเมลเพื่อแจ้งแนวทางและราคาประเมิน
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span className="text-pretty">
                      นำเครื่องเข้ามารับบริการที่ศูนย์ หรือส่งพัสดุตามที่นัดหมายกับช่าง
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-200">ต้องการสอบถามด่วนทางโทรศัพท์?</p>
              <p className="font-mono text-sky-400 font-bold text-xs">โทร. 081-111-1111</p>
            </div>
          </div>

          {/* Right Panel: Clean Structured Form */}
          <div className="lg:col-span-8 p-5 sm:p-8 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                กรอกรายละเอียดเพื่อแจ้งซ่อมอุปกรณ์
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอกข้อมูลให้ครบถ้วน
              </p>
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-fade">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs sm:text-sm">ส่งเรื่องแจ้งซ่อมสำเร็จ</h4>
                  <p className="text-xs text-emerald-800">{successMsg}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2.5 animate-fade">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs font-medium">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* 1. Service Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-600" />
                  <span>1. รายการบริการที่ต้องการซ่อม (เว้นว่างได้หากต้องการปรึกษาช่างก่อน)</span>
                </label>

                <select
                  value={serviceId}
                  onChange={(e) => handleServiceSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition-colors cursor-pointer"
                >
                  <option value="">
                    -- ไม่แน่ใจอาการ / ให้ช่างช่วยตรวจเช็คและประเมินราคา --
                  </option>
                  {categories.map((cat) => {
                    const catServices = services.filter((s) => s.cg_id === cat.cg_id);
                    if (catServices.length === 0) return null;
                    return (
                      <optgroup key={cat.cg_id} label={`หมวดหมู่: ${cat.cg_name}`}>
                        {catServices.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — ราคาประเมิน ฿{s.price.toLocaleString()} บาท
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Promotion Code Section */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-sky-600" />
                    <span>โค้ดส่วนลดโปรโมชั่น (Promotion Code)</span>
                  </label>
                  {appliedPromo && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-700" />
                      <span>ลด 20% สำเร็จ</span>
                    </span>
                  )}
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="font-mono font-bold text-xs text-emerald-900">
                          {appliedPromo} (ส่วนลดค่าบริการ 20%)
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          ใช้สิทธิ์ลดค่าบริการ 20% สำหรับงานซ่อมรายการนี้เรียบร้อยแล้ว
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      ยกเลิกโค้ด
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => {
                          setPromoCodeInput(e.target.value);
                          if (promoError) setPromoError('');
                        }}
                        placeholder="กรอกโค้ดส่วนลด เช่น HALLOWEEN20"
                        className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                      >
                        ใช้โค้ด
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] gap-1 text-slate-500 pt-0.5">
                      <span>
                        มีโค้ดโปรโมชั่นประจำเดือน?{' '}
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('HALLOWEEN20')}
                          className="font-bold text-sky-700 hover:underline cursor-pointer font-mono"
                        >
                          คลิกเพื่อใช้โค้ด HALLOWEEN20
                        </button>
                      </span>
                      <span className="text-emerald-700 font-medium">ลด 20% ทุกรายการ</span>
                    </div>

                    {promoError && (
                      <p className="text-[11px] text-red-600 font-medium">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>ชื่อผู้ติดต่อ *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cmUsername}
                    onChange={(e) => setCmUsername(e.target.value)}
                    placeholder="ชื่อ-นามสกุล หรือชื่อเล่น"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>เบอร์โทรศัพท์ (10 หลัก) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={cmCel}
                    onChange={handlePhoneChange}
                    placeholder="08x-xxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>อีเมลติดต่อกลับ *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={cmEmail}
                    onChange={(e) => setCmEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              {/* 3. Symptom Description */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>2. รายละเอียดอาการเสียของอุปกรณ์ *</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={cmSymptom}
                  onChange={(e) => setCmSymptom(e.target.value)}
                  placeholder="ระบุรุ่นอุปกรณ์และอาการที่พบ เช่น โน้ตบุ๊กเปิดติดแต่ภาพไม่ขึ้นหน้าจอ, มือถือชาร์จไฟไม่เข้า..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors leading-relaxed"
                ></textarea>
              </div>

              {/* 4. Optional Image URL */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>ลิงก์รูปภาพอาการเสียเพิ่มเติม (ถ้ามี)</span>
                </label>
                <input
                  type="url"
                  value={cmImage}
                  onChange={(e) => setCmImage(e.target.value)}
                  placeholder="https://example.com/device-photo.jpg (เว้นว่างได้)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  ข้อมูลของท่านจะถูกส่งไปยังทีมช่างโดยตรงและเก็บรักษาเป็นความลับ
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องแจ้งซ่อม'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
