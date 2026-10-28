import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cpu, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'หน้าแรก', path: '/' },
    { name: 'บริการซ่อม (Services)', path: '/services' },
    { name: 'เกี่ยวกับเรา & ส่งซ่อม (About Me)', path: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand */}
            {/* [จุดเปลี่ยนรูปภาพ LOGO]: หากต้องการใช้รูปภาพแทนไอคอน CPU ด้านล่าง 
                สามารถแทนที่แท็ก <div className="w-10 h-10..."> ด้วย:
                <img src="/logo.png" alt="Fix Please Logo" className="w-10 h-10 object-contain" /> */}
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-500 flex items-center justify-center shadow-sm shadow-sky-600/20 group-hover:scale-105 active:scale-95 transition-all duration-300">
                <Cpu className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                    Fix<span className="text-sky-600">Please</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 font-sans">
                    Pro Care
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  ศูนย์ซ่อมอิเล็กทรอนิกส์มาตรฐานสูง
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive(link.path)
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Right Status Badge / Admin Access (NO login/register buttons on public navbar as per requirement) */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>แดชบอร์ด ({user.role === 'admin' ? 'Admin' : 'ช่าง'})</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="ออกจากระบบ"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>เปิดรับซ่อมปกติ 08:30 - 18:30 น.</span>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-2xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none active:scale-95 transition-transform"
                aria-label="เปิดเมนูนำทาง"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer with Backdrop Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs animate-backdrop"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-modal">
            <div className="space-y-6">
              {/* Header */}
              {/* [จุดเปลี่ยนรูปภาพ LOGO บนมือถือ]: แทนที่ <div className="w-9 h-9..."> ด้วย <img src="/logo.png" className="w-9 h-9 object-contain" /> */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-900 text-base">Fix Please</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive(link.path)
                        ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Bottom info */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/admin"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>จัดการระบบหลังบ้าน ({user.role === 'admin' ? 'Admin' : 'ช่าง'})</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-center py-2 text-xs font-bold text-rose-600 hover:underline"
                  >
                    ออกจากระบบ (Sign Out)
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">ศูนย์บริการ Fix Please</p>
                  <p className="text-[11px] text-slate-500">โทร: 081-234-5678 (จันทร์-เสาร์)</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
