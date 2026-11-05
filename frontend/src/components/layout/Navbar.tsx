import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.jpg';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'รายการบริการซ่อม', path: '/services' },
    { name: 'เกี่ยวกับเรา & แจ้งซ่อม', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-9 rounded-lg bg-white border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 group-hover:border-sky-400 transition-colors duration-200">
              <img
                src={logoImg}
                alt="FixPlease Logo"
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none font-['Plus_Jakarta_Sans']">
                Fix<span className="text-sky-600">Please</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
                ศูนย์ซ่อมคอมพิวเตอร์และอุปกรณ์ไอที
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/admin/inbox'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>ระบบจัดการงานซ่อม ({user.u_name})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                <span>สำหรับเจ้าหน้าที่</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="เปิดเมนู"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3.5 py-2.5 rounded-lg text-xs font-semibold ${
                isActive(link.path)
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/admin/inbox'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>ระบบจัดการงานซ่อม ({user.u_name})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <span>เข้าสู่ระบบเจ้าหน้าที่</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
