import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../api/client';

export const AdminPlaceholder: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      // หากยังไม่ Login ให้พาไปหน้า Login ก่อน ตาม Requirement
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      apiRequest('/dashboard').then((res) => {
        if (res.success && res.data) {
          setStats(res.data.summary);
        }
      }).catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <span>กำลังตรวจสอบสิทธิ์การเข้าถึง...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
              <span>สิทธิ์การเข้าถึง: {user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ช่างประจำศูนย์ (Technician)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ยินดีต้อนรับ, {user.u_name} {user.u_surname} (@{user.username})
            </h1>
            <p className="text-xs text-slate-500">
              {user.role === 'admin'
                ? 'คุณมีสิทธิ์เข้าถึงทุกหน้าในระบบ (Dashboard, Services, Inbox, User Management)'
                : 'คุณสามารถเข้าถึงหน้ากล่องข้อความแจ้งซ่อม Inbox เพื่อจัดการงานซ่อม'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ (Logout)</span>
            </button>
          </div>
        </div>

        {/* Dashboard Preview Cards (For Admin) */}
        {user.role === 'admin' && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">รายรับทั้งหมด</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">฿{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">คำนวณจากงานซ่อมเสร็จ</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">รายรับรอบสัปดาห์</span>
                <TrendingUp className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-black text-sky-600">฿{stats.weeklyRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">7 วันย้อนหลัง</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">สินค้าที่รอซ่อม</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{stats.pendingRepairsCount} รายการ</p>
              <p className="text-[11px] text-slate-400">สถานะรอซ่อม</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase">สินค้าที่ซ่อมแล้ว</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600">{stats.completedRepairsCount} รายการ</p>
              <p className="text-[11px] text-slate-400">สถานะซ่อมเสร็จแล้ว</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
