import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const { showToast } = useService();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/admin/inbox', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      showToast('เข้าสู่ระบบสำเร็จ');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center mx-auto">
            <Cpu className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              เข้าสู่ระบบสำหรับเจ้าหน้าที่
            </h1>
            <p className="text-xs text-slate-500 mt-1 text-pretty">
              <span className="inline-block">ระบบจัดการคิวงานซ่อมและข้อมูลบริการ</span>{' '}
              <span className="inline-block">สำหรับผู้ดูแลระบบและช่างประจำศูนย์</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ชื่อผู้ใช้งาน (Username)</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">รหัสผ่าน (Password)</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>กำลังตรวจสอบข้อมูล...</span>
                ) : (
                  <>
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
