import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, PhoneCall, Mail, MapPin, ShieldCheck, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          {/* [จุดเปลี่ยนรูปภาพ LOGO ใน Footer]: หากต้องการใช้รูปภาพแทนไอคอน CPU ด้านล่าง 
              สามารถแทนที่แท็ก <div className="w-10 h-10..."> ด้วย:
              <img src="/logo.png" alt="Fix Please Logo" className="w-10 h-10 object-contain" /> */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-md shadow-sky-900/30">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
                Fix<span className="text-sky-400">Please</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              ศูนย์บริการตรวจเช็คและซ่อมบำรุงอุปกรณ์อิเล็กทรอนิกส์ครบวงจร ทั้ง Computer, Laptop และ Smartphone ซ่อมตรงจุด ราคาโปร่งใส พร้อมรับประกันงานซ่อมนาน 90 วัน
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-800/40 w-fit">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>รับประกันงานซ่อมและอะไหล่แท้</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">เมนูนำทาง</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-sky-400 transition-colors">หน้าแรก (Home)</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-sky-400 transition-colors">บริการซ่อมทั้งหมด (Services)</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-400 transition-colors">เกี่ยวกับเรา & นัดหมายส่งซ่อม (About Me)</Link>
              </li>
            </ul>
          </div>

          {/* Repair Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">หมวดหมู่อุปกรณ์</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>คอมพิวเตอร์ตั้งโต๊ะ (PC & Workstation)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>โน้ตบุ๊ก & แล็ปท็อป (MacBook & Notebook)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>สมาร์ตโฟน & แท็บเล็ต (iPhone / iPad / Android)</span>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">ข้อมูลติดต่อ</h4>
            <div className="space-y-2.5 text-xs text-slate-400 font-normal">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>123/45 ถนนสุขุมวิท คลองเตย กรุงเทพมหานคร 10110</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
                <span>081-234-5678, 02-987-6543</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>contact@fixplease.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>จันทร์ - เสาร์: 08:30 - 18:30 น. (หยุดวันอาทิตย์)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Fix Please Electronic Repair System. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Soft Eye-Care & Clean Tech Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
