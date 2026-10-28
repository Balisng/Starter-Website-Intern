import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useAuth();
  const navigate = useNavigate();

  // หากล็อกอินอยู่แล้ว ให้พาไปหน้า Admin ทันทีตาม Requirement
  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('กรุณากรอก Username และรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      // สำเร็จ พาไปหน้า Admin
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Username หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Icon & Brand */}
        {/* [จุดเปลี่ยนรูปภาพ LOGO ในหน้า Login]: หากต้องการใช้รูปภาพแทนไอคอน CPU ด้านล่าง 
            สามารถแทนที่แท็ก <div className="w-12 h-12..."> ด้วย:
            <img src="/logo.png" alt="Fix Please Logo" className="w-12 h-12 object-contain mx-auto" /> */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center mx-auto shadow-sm shadow-sky-600/20">
            <Cpu className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-['Plus_Jakarta_Sans']">
                Fix<span className="text-sky-600">Please</span>
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              เข้าสู่ระบบหลังบ้าน
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              เฉพาะเจ้าหน้าที่ผู้ดูแลระบบ (Admin) และช่างประจำศูนย์เท่านั้น
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          
          {/* Default Account Hint (ตรงตาม Requirement: Admin 1234) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>บัญชีเริ่มต้นสำหรับการทดสอบระบบ:</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] bg-white px-3 py-1 rounded-xl border border-slate-200">
              <span>Username: <strong>Admin</strong></span>
              <span>Password: <strong>1234</strong></span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Username Field */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Username (ชื่อผู้ใช้)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ เช่น Admin"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">
                Password (รหัสผ่าน)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>กำลังตรวจสอบสิทธิ์...</span>
                ) : (
                  <>
                    <span>เข้าสู่ระบบ (Sign In)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

          </form>

          <div className="text-center pt-1 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-normal">
              เข้าสู่ระบบผ่านการยืนยันตัวตนด้วย Secure HttpOnly Cookie
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
