import React, { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Inbox,
  FileCheck2,
  Users,
  LogOut,
  ChevronRight,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import { apiRequest } from '../../api/client';
import type { InboxMessage } from '../../types';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { LoginPage } from '../Login/LoginPage';
import logoImg from '../../assets/logo.jpg';

export const AdminLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const { showToast } = useService();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Fetch unread active inbox messages count
  useEffect(() => {
    if (user) {
      apiRequest<InboxMessage[]>('/inbox', {
        params: { read_status: 'unread', repair_status: 'active' },
      })
        .then((res) => {
          if (res.success && res.data) {
            setUnreadCount(res.data.length);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span>กำลังตรวจสอบสิทธิ์การเข้าถึงระบบ...</span>
        </div>
      </div>
    );
  }

  // เข้าหน้า Login ผ่าน path /admin เท่านั้น
  if (!user) {
    if (location.pathname !== '/admin') {
      return <Navigate to="/admin" replace />;
    }
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-800 antialiased selection:bg-sky-600 selection:text-white overflow-x-hidden">
        <Navbar />
        <main className="flex-grow min-w-0">
          <LoginPage />
        </main>
        <Footer />
      </div>
    );
  }

  // กฎสิทธิ์: ช่าง (technician) ห้ามเห็นหรือเข้าหน้า Dashboard เด็ดขาด
  // อนุญาตเฉพาะหน้าคิวงานซ่อม (/admin/inbox) และหน้าประวัติการซ่อม (/admin/history)
  if (user.role === 'technician') {
    const allowedPaths = ['/admin/inbox', '/admin/history'];
    const isAllowed = allowedPaths.some((p) => location.pathname.startsWith(p));
    if (!isAllowed) {
      return <Navigate to="/admin/inbox" replace />;
    }
  } else if (user.role === 'admin' && location.pathname === '/admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const isAdmin = user.role === 'admin';

  // Navigation menu items based on Role (ซ่อน Dashboard จากช่างอย่างสมบูรณ์)
  const navItems = [
    ...(isAdmin
      ? [
          {
            name: 'ภาพรวมศูนย์ซ่อม',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'จัดการรายการบริการ',
            path: '/admin/services',
            icon: Wrench,
          },
        ]
      : []),
    {
      name: 'คิวงานแจ้งซ่อม',
      path: '/admin/inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      name: 'ประวัติการซ่อม & ผลงานช่าง',
      path: '/admin/history',
      icon: FileCheck2,
    },
    ...(isAdmin
      ? [
          {
            name: 'จัดการผู้ใช้งานและสิทธิ์',
            path: '/admin/users',
            icon: Users,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Mobile & Tablet Sticky Top Header (< lg) */}
      <div className="lg:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
            aria-label="เปิดเมนูนำทาง"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-7 rounded-lg bg-white border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={logoImg}
              alt="FixPlease Logo"
              className="w-full h-full object-cover scale-125"
            />
          </div>
          <span className="font-bold text-sm tracking-tight font-['Plus_Jakarta_Sans']">
            Fix<span className="text-sky-400">Please</span>
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/60 text-xs font-bold transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Mobile & Tablet Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-xs lg:hidden animate-backdrop"
        />
      )}

      {/* Fixed Sidebar (อยู่กับที่ตลอดเวลาแม้เลื่อนหน้าจอลงสุด) */}
      <aside
        className={`fixed inset-y-0 left-0 h-dvh w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto flex-1">
          {/* Brand & Portal Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-9 rounded-xl bg-white border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={logoImg}
                  alt="FixPlease Logo"
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <div>
                <span className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  Fix<span className="text-sky-400">Please</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isAdmin ? 'ระบบผู้ดูแลศูนย์ซ่อม' : 'ระบบปฏิบัติงานช่างซ่อม'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-100 truncate">
                {user.u_name} {user.u_surname}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                  isAdmin
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/70'
                    : 'bg-sky-950 text-sky-300 border border-sky-800/70'
                }`}
              >
                {isAdmin ? 'ผู้ดูแลระบบ' : 'ช่างเทคนิค'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate font-mono">
              @{user.username} • {user.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
              เมนูระบบงานซ่อม
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500 text-white shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions (ล็อกติดด้านล่างของ Sidebar เสมอ ไม่ต้องเลื่อนกลับขึ้นไป) */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Home className="w-4 h-4 text-sky-400 shrink-0" />
            <span>กลับสู่หน้าหลักเว็บไซต์</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-900/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 shrink-0" />
              <span>ออกจากระบบ</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content Area (เว้นระยะซ้าย lg:pl-64 ให้สอดคล้องกับ Fixed Sidebar) */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
