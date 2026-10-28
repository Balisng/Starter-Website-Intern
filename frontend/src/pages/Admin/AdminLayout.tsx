import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Inbox,
  Users,
  LogOut,
  ChevronRight,
  Home,
  Menu,
  X,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';

export const AdminLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Check auth and redirect if not logged in (ตาม Requirement)
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Fetch unread inbox messages count
  useEffect(() => {
    if (user) {
      apiRequest('/inbox', { params: { read_status: 'unread' } })
        .then((res) => {
          if (res.success && res.data) {
            setUnreadCount(res.data.length);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // Check technician role restriction:
  // "ส่วนช่างจะไม่มีสิทธิในการจัดการผู้ใช้งาน และเข้าถึงได้แค่หน้าInbox เท่านั้น"
  useEffect(() => {
    if (user && user.role === 'technician') {
      const allowedPaths = ['/admin/inbox'];
      const isAllowed = allowedPaths.some((p) => location.pathname.startsWith(p));
      if (!isAllowed) {
        navigate('/admin/inbox', { replace: true });
      }
    } else if (user && user.role === 'admin' && location.pathname === '/admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3 text-xs">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span>กำลังตรวจสอบสิทธิ์การเข้าถึงระบบหลังบ้าน...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  // Navigation menu items based on Role
  const navItems = [
    ...(isAdmin
      ? [
          {
            name: 'Dashboard (แดชบอร์ด)',
            path: '/admin/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'จัดการบริการ (Services)',
            path: '/admin/services',
            icon: Wrench,
          },
        ]
      : []),
    {
      name: 'กล่องข้อความแจ้งซ่อม (Inbox)',
      path: '/admin/inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    ...(isAdmin
      ? [
          {
            name: 'จัดการผู้ใช้งาน (Users)',
            path: '/admin/users',
            icon: Users,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      
      {/* Mobile Top Header */}
      {/* [จุดเปลี่ยนรูปภาพ LOGO บนมือถือ]: แทนที่ <div className="w-8 h-8..."> ด้วย <img src="/logo.png" className="w-8 h-8 object-contain" /> */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center shadow-xs">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight font-['Plus_Jakarta_Sans']">
            FixPlease <span className="text-sky-400 text-xs uppercase font-mono">Console</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800"
          aria-label="เปิดเมนูนำทาง"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden animate-backdrop"
        />
      )}

      {/* Admin Sidebar (Modern Dark Mode) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6">
          
          {/* Brand & Portal Title */}
          {/* [จุดเปลี่ยนรูปภาพ LOGO ใน Admin Sidebar]: หากต้องการใช้รูปภาพแทนไอคอน CPU ด้านล่าง 
              สามารถแทนที่แท็ก <div className="w-9 h-9..."> ด้วย:
              <img src="/logo.png" alt="Fix Please Logo" className="w-9 h-9 object-contain" /> */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shadow-md shadow-sky-900/40">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                  Fix<span className="text-sky-400">Please</span>
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {isAdmin ? 'Admin Console' : 'Technician Workspace'}
                </p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100 truncate">
                {user.u_name} {user.u_surname}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                    : 'bg-sky-950/70 text-sky-300 border border-sky-800/60'
                }`}
              >
                {isAdmin ? 'Admin' : 'ช่าง'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate font-mono">@{user.username} • {user.email}</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
              เมนูจัดการระบบ
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-slate-800/80 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>กลับหน้าแรกเว็บไซต์</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ (Logout)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </aside>

      {/* Main Dark Mode Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
