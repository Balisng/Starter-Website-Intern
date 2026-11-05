import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-8 rounded-lg bg-white border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={logoImg}
                  alt="FixPlease Logo"
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Fix<span className="text-sky-400">Please</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed text-pretty">
              <span className="inline-block">ศูนย์ซ่อมคอมพิวเตอร์ โน้ตบุ๊ก</span>{' '}
              <span className="inline-block">และสมาร์ตโฟนครบวงจร</span>{' '}
              <span className="inline-block">ประเมินราคาก่อนซ่อมทุกครั้ง</span>{' '}
              <span className="inline-block">ใช้อะไหล่แท้มาตรฐาน</span>{' '}
              <span className="inline-block">พร้อมรับประกันงานซ่อมทุกชิ้น</span>
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              เมนูหลัก
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-400 hover:text-white transition-colors">
                  รายการบริการและราคาประเมิน
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  เกี่ยวกับร้านและช่องทางติดต่อ
                </Link>
              </li>
              <li>
                <Link to="/about#contact" className="text-slate-400 hover:text-white transition-colors">
                  ส่งเรื่องแจ้งซ่อมออนไลน์
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              ประเภทอุปกรณ์ที่รับซ่อม
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>คอมพิวเตอร์ตั้งโต๊ะ และเวิร์กสเตชัน</li>
              <li>โน้ตบุ๊กทั่วไป และโน้ตบุ๊กเกมมิ่ง</li>
              <li>สมาร์ตโฟน และแท็บเล็ตทุกรุ่น</li>
              <li>อัปเกรดสเปก ทำความสะอาด และกู้ข้อมูล</li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              ติดต่อศูนย์บริการ
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-pretty">
                  เลขที่ 99/1 อาคารดิจิทัลพลาซ่า ชั้น 3 ถนนพญาไท เขตราชเทวี กรุงเทพฯ 10400
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-slate-300">081-111-1111, 02-999-8888</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@fixplease.co.th</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>เปิดบริการทุกวัน: 09:30 - 20:00 น.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} FixPlease Repair Studio. สงวนลิขสิทธิ์ทุกประการ</p>
          <p>ตรวจเช็คอาการฟรี • แจ้งราคาก่อนซ่อม • รับประกันงานซ่อม 90 วัน</p>
        </div>
      </div>
    </footer>
  );
};
