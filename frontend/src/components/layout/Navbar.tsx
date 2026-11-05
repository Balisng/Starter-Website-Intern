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
          {/* Left: Brand Logo */}
          <div className="flex-1 flex items-center justify-start min-w-0">
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
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
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center justify-center gap-1 shrink-0">
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

          {/* Right: Logged-in Staff Shortcut & Mobile Hamburger */}
          <div className="flex items-center justify-end md:flex-1 min-w-0">
            {user && (
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/admin/inbox'}
                className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>ระบบจัดการงานซ่อม ({user.u_name})</span>
              </Link>
            )}

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

          {user && (
            <div className="pt-2 mt-2 border-t border-slate-100">
              <Link
                to={user.role === 'admin' ? '/admin/dashboard' : '/admin/inbox'}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-slate-900"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>ระบบจัดการงานซ่อม ({user.u_name})</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
