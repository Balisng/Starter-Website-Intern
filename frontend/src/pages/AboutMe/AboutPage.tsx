import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Award,
  CheckCircle2,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
  Check,
  Sparkles,
  ZoomIn,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useService } from '../../context/ServiceContext';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import type { Service } from '../../types';

export const AboutPage: React.FC = () => {
  const { selectedService, selectService, clearSelectedService } = useService();
  const location = useLocation();
  const navigate = useNavigate();

  // Services list for dropdown
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | 'unspecified'>('unspecified');

  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  // Contact Form State
  const [formData, setFormData] = useState({
    cm_username: '',
    cm_cel: '',
    cm_email: '',
    cm_symptom: '',
    cm_image: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch active services for the dropdown
  useEffect(() => {
    apiRequest<Service[]>('/services')
      .then((res) => {
        if (res.success && res.data) {
          setServicesList(res.data.filter((s) => s.status));
        }
      })
      .catch((err) => console.error('Error fetching services for dropdown:', err));
  }, []);

  // Sync selectedService from context if arriving from Services page
  useEffect(() => {
    if (selectedService) {
      setSelectedServiceId(selectedService.id);
    }
  }, [selectedService]);

  // Scroll to #contact if hash is present
  useEffect(() => {
    if (location.hash === '#contact') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const handleServiceChange = (val: string) => {
    if (val === 'unspecified') {
      setSelectedServiceId('unspecified');
      clearSelectedService();
    } else {
      const id = Number(val);
      setSelectedServiceId(id);
      const found = servicesList.find((s) => s.id === id);
      if (found) {
        selectService(found);
      }
    }
  };

  const currentChosenService =
    selectedServiceId !== 'unspecified'
      ? servicesList.find((s) => s.id === selectedServiceId) || selectedService
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.cm_username || !formData.cm_cel || !formData.cm_email || !formData.cm_symptom) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องที่มีเครื่องหมาย *');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        service_id: selectedServiceId === 'unspecified' ? null : selectedServiceId,
        cm_username: formData.cm_username.trim(),
        cm_cel: formData.cm_cel.trim(),
        cm_email: formData.cm_email.trim(),
        cm_symptom: formData.cm_symptom.trim(),
        cm_image: formData.cm_image.trim() || null,
      };

      const res = await apiRequest('/inbox', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSubmitSuccess(res.data);
        setFormData({
          cm_username: '',
          cm_cel: '',
          cm_email: '',
          cm_symptom: '',
          cm_image: '',
        });
      } else {
        setErrorMessage(res.message || 'ส่งข้อมูลไม่สำเร็จ');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-14 bg-[#f8fafc] min-h-screen text-slate-800">
      
      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage?.src || null}
        alt={lightboxImage?.alt}
        onClose={() => setLightboxImage(null)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        
        {/* ======================================================== */}
        {/* 1. ABOUT ME / SHOP SECTION */}
        {/* ======================================================== */}
        <section className="space-y-12">
          
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-wider uppercase text-sky-800 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>เกี่ยวกับศูนย์บริการ Fix Please (About Me)</span>
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              ความมุ่งมั่นและมาตรฐานงานซ่อมระดับมืออาชีพ
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed font-normal">
              Fix Please ก่อตั้งขึ้นจากความหลงใหลในเทคโนโลยีและวงจรอิเล็กทรอนิกส์ เรามุ่งเน้นการให้บริการซ่อมบำรุงที่โปร่งใส วิเคราะห์ปัญหาตรงจุด ไม่ยัดเยียดการเปลี่ยนอะไหล่ที่ไม่จำเป็น
            </p>
          </div>

          {/* Core Values Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Award,
                title: 'ช่างผู้เชี่ยวชาญ',
                desc: 'ทีมช่างผ่านการอบรมงานซ่อมระดับชิปเซ็ต ประสบการณ์มากกว่า 10 ปี',
                iconColor: 'text-sky-600 bg-sky-50 border-sky-100',
              },
              {
                icon: Wrench,
                title: 'เครื่องมือระดับแล็บ',
                desc: 'กล้องไมโครสโคปความแม่นยำสูง เครื่องเป่าลมร้อนควบคุมอุณหภูมิมาตรฐาน',
                iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
              },
              {
                icon: ShieldCheck,
                title: 'รับประกันงานซ่อม 90 วัน',
                desc: 'อุ่นใจหลังซ่อมด้วยการรับประกันชิ้นส่วนและบริการ หากมีปัญหาดูแลฟรี',
                iconColor: 'text-sky-600 bg-sky-50 border-sky-100',
              },
              {
                icon: CheckCircle2,
                title: 'ปลอดภัยต่อข้อมูล',
                desc: 'รักษาความลับข้อมูลส่วนบุคคลในเครื่องของลูกค้า 100% ไม่เปิดดูหรือคัดลอก',
                iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
              },
            ].map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-sm hover:-translate-y-1 transition-all duration-200 space-y-2.5"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${val.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {val.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Shop Details */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-2xs grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-3.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                ยินดีต้อนรับสู่หน้าร้านและศูนย์รับบริการ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                ท่านสามารถนำอุปกรณ์เดินทางเข้ามาให้ช่างตรวจเช็คอาการได้โดยตรง หรือส่งผ่านบริการขนส่งพัสดุ (Flash, Kerry, ไปรษณีย์ไทย) เรามีทีมงานคอยรับและบันทึกข้อมูลเข้าระบบพร้อมถ่ายภาพสภาพเครื่องส่งให้ท่านตรวจสอบ
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>123/45 ถนนสุขุมวิท คลองเตย กทม. 10110</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>081-234-5678 (สายด่วนช่าง)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>contact@fixplease.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>เปิดบริการ: จันทร์ - เสาร์ 08:30 - 18:30 น.</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-11 h-11 rounded-full bg-white shadow-2xs flex items-center justify-center text-sky-600">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-900">แผนที่ศูนย์บริการ Fix Please</p>
              <p className="text-[11px] text-slate-500 font-normal">ติดสถานี BTS พร้อมที่จอดรถสะดวกสบาย</p>
            </div>
          </div>

        </section>

        {/* ======================================================== */}
        {/* 2. CONTACT US / REPAIR INTAKE SECTION */}
        {/* รองรับ 2 ช่องทาง: เข้าผ่าน About Me โดยตรง หรือเลือกมาจากหน้า Services */}
        {/* ======================================================== */}
        <section id="contact" className="scroll-mt-24 pt-4">
          
          <div className="p-7 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
            
            {/* Section Header */}
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-bold tracking-wider uppercase text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-flex items-center gap-1.5 mb-2">
                <Send className="w-3.5 h-3.5" />
                <span>Contact Us (แจ้งนัดหมายส่งซ่อม)</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                ส่งคำขอแจ้งซ่อมและนัดหมายช่าง
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal">
                กรอกรายละเอียดอาการเสียและข้อมูลติดต่อ ช่างประจำศูนย์จะติดต่อกลับเพื่อประเมินและนัดหมายเวลาซ่อมโดยเร็ว
              </p>
            </div>

            {submitSuccess ? (
              // SUCCESS CONFIRMATION
              <div className="p-8 rounded-3xl bg-emerald-50/80 border border-emerald-200 text-center space-y-3.5 animate-modal">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white shadow-xs flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-bold text-emerald-950">
                    ส่งข้อมูลแจ้งซ่อมสำเร็จเรียบร้อย!
                  </h3>
                  <p className="text-xs text-emerald-800 font-normal">
                    รหัสคำขอซ่อม: <strong className="font-mono">#{submitSuccess.cm_id}</strong> | ช่างได้รับข้อมูลแล้วและจะติดต่อกลับผ่านเบอร์โทร <strong className="font-mono">{submitSuccess.cm_cel}</strong> โดยเร็ว
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitSuccess(null);
                      clearSelectedService();
                      setSelectedServiceId('unspecified');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    ส่งรายการซ่อมอื่นเพิ่มเติม
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    กลับสู่หน้าแรก
                  </button>
                </div>
              </div>
            ) : (
              // ACTIVE CONTACT FORM
              <div className="space-y-6">
                
                {/* Service Selection Dropdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-sky-600" />
                      <span>เลือกบริการที่ต้องการซ่อม (Service):</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/services')}
                      className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <span>ดูรายละเอียดบริการทั้งหมด</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <select
                    value={selectedServiceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium transition-all"
                  >
                    <option value="unspecified">
                      🔍 ไม่แน่ใจอาการ / ปรึกษาช่างก่อน (ประเมินภายหลัง)
                    </option>
                    {servicesList.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        [{srv.cg_name || 'บริการ'}] {srv.name} — ฿{srv.price.toLocaleString()} บาท
                      </option>
                    ))}
                  </select>

                  {/* Dynamic Service Status Card */}
                  {currentChosenService ? (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 animate-fade">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setLightboxImage({ src: currentChosenService.service_image, alt: currentChosenService.name })}
                          className="relative group cursor-zoom-in w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0"
                        >
                          <img
                            src={currentChosenService.service_image}
                            alt={currentChosenService.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=100';
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-100">
                              {currentChosenService.cg_name || 'บริการที่เลือก'}
                            </span>
                            <span className="text-xs font-bold text-rose-600 font-mono">
                              ฿{currentChosenService.price.toLocaleString()} บาท
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">
                            {currentChosenService.name}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleServiceChange('unspecified')}
                        className="text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:underline shrink-0"
                      >
                        เปลี่ยนเป็นไม่แน่ใจอาการ
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-900 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        i
                      </div>
                      <div>
                        <p className="font-bold">โหมดปรึกษาอาการและประเมินราคาภายหลัง</p>
                        <p className="text-[11px] text-sky-700 mt-0.5 font-normal">
                          คุณสามารถส่งข้อมูลอาการเสียเข้ามาได้เลยทันที ช่างผู้เชี่ยวชาญจะติดต่อกลับเพื่อวินิจฉัยปัญหาและประเมินราคาก่อนเริ่มซ่อมจริง
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Customer Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        ชื่อ-นามสกุล ผู้ส่งซ่อม <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cm_username}
                        onChange={(e) => setFormData({ ...formData, cm_username: e.target.value })}
                        placeholder="เช่น สมชาย ใจดี"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.cm_cel}
                        onChange={(e) => setFormData({ ...formData, cm_cel: e.target.value })}
                        placeholder="เช่น 081-234-5678"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        อีเมล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.cm_email}
                        onChange={(e) => setFormData({ ...formData, cm_email: e.target.value })}
                        placeholder="เช่น somchai@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Symptom Details */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      อาการเสียของสินค้า / รายละเอียดที่ต้องการแจ้งช่าง <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.cm_symptom}
                      onChange={(e) => setFormData({ ...formData, cm_symptom: e.target.value })}
                      placeholder="ระบุอาการเสีย เช่น จอแตกสัมผัสไม่ได้ หรือเครื่องเปิดไม่ติดมีเสียงร้องเตือน ฯลฯ"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    ></textarea>
                  </div>

                  {/* Image URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      ลิงก์รูปภาพตัวอย่างความเสียหาย (หากมี - ไม่บังคับ)
                    </label>
                    <input
                      type="url"
                      value={formData.cm_image}
                      onChange={(e) => setFormData({ ...formData, cm_image: e.target.value })}
                      placeholder="เช่น https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>กำลังส่งข้อมูล...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>ยืนยันการส่งซ่อม (Submit Request)</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            )}

          </div>

        </section>

      </div>
    </div>
  );
};
