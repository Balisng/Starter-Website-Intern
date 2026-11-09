import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Shield,
  UserCheck,
  Search,
  X,
  AlertCircle,
  PhoneCall,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useService } from '../../context/ServiceContext';
import type { User as UserType } from '../../types';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useService();
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [flashKey, setFlashKey] = useState<number>(0);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'technician'>('all');
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Form State
  const [form, setForm] = useState({
    username: '',
    pwd: '',
    u_name: '',
    u_surname: '',
    role: 'technician' as 'admin' | 'technician',
    cel: '',
    email: '',
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchUsers = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await apiRequest<UserType[]>('/users');
      if (res.success && res.data) {
        setUsersList(res.data);
      }
      if (isManualRefresh) {
        setFlashKey((prev) => prev + 1);
        showToast('รีเฟรชรายชื่อผู้ใช้งานล่าสุดเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (isManualRefresh) {
        showToast('ไม่สามารถรีเฟรชข้อมูลได้', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(false);
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      username: '',
      pwd: '',
      u_name: '',
      u_surname: '',
      role: 'technician',
      cel: '',
      email: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (target: UserType) => {
    setEditingUser(target);
    setForm({
      username: target.username,
      pwd: '',
      u_name: target.u_name,
      u_surname: target.u_surname,
      role: target.role,
      cel: target.cel,
      email: target.email,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 6) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
    } else if (raw.length > 3) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    }
    setForm((prev) => ({ ...prev, cel: formatted }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.u_name.trim() || !form.u_surname.trim()) {
      setFormError('กรุณากรอกชื่อจริงและนามสกุล');
      return;
    }

    if (!editingUser) {
      if (!form.username.trim() || form.username.trim().length < 3) {
        setFormError('ชื่อผู้ใช้ (Username) ต้องมีอย่างน้อย 3 ตัวอักษร');
        return;
      }
      if (!form.pwd || form.pwd.length < 4) {
        setFormError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        return;
      }
    } else if (form.pwd && form.pwd.length < 4) {
      setFormError('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร');
      return;
    }

    const cleanCel = form.cel.replace(/\D/g, '');
    if (!cleanCel) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }
    if (!/^0[689]\d{8}$/.test(cleanCel)) {
      setFormError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (06x, 08x, 09x ครบ 10 หลัก)');
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)*(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com|[a-zA-Z0-9-]+\.(com|co\.th|ac\.th|or\.th|go\.th))$/i;
    if (!form.email.trim()) {
      setFormError('กรุณากรอกอีเมล');
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      setFormError(
        'รูปแบบอีเมลไม่ถูกต้อง (อนุญาตเฉพาะ @gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com หรือโดเมนมาตรฐาน .com, .co.th, .ac.th)'
      );
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingUser) {
        const payload: Record<string, unknown> = {
          u_name: form.u_name.trim(),
          u_surname: form.u_surname.trim(),
          role: form.role,
          cel: form.cel.trim(),
          email: form.email.trim(),
        };
        if (form.pwd.trim()) {
          payload.pwd = form.pwd.trim();
        }

        const res = await apiRequest(`/users/${editingUser.u_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        if (res.success) {
          setModalOpen(false);
          showToast(`อัปเดตข้อมูลผู้ใช้งาน "${form.u_name.trim()}" เรียบร้อยแล้ว`);
          fetchUsers(false);
        } else {
          setFormError(res.message || 'แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ');
        }
      } else {
        const res = await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify({
            username: form.username.trim(),
            pwd: form.pwd.trim(),
            u_name: form.u_name.trim(),
            u_surname: form.u_surname.trim(),
            role: form.role,
            cel: form.cel.trim(),
            email: form.email.trim(),
          }),
        });

        if (res.success) {
          setModalOpen(false);
          showToast(`เพิ่มผู้ใช้งาน "${form.u_name.trim()}" เรียบร้อยแล้ว`);
          fetchUsers(false);
        } else {
          setFormError(res.message || 'เพิ่มผู้ใช้ไม่สำเร็จ');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      setFormError(message);
      showToast(message, 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.u_id === currentUser?.u_id) {
      showToast('ไม่สามารถลบบัญชีตนเองขณะกำลังเข้าสู่ระบบอยู่ได้', 'error');
      return;
    }

    setDeleting(true);
    try {
      const res = await apiRequest(`/users/${deleteTarget.u_id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        showToast(`ลบผู้ใช้งาน "${deleteTarget.u_name} ${deleteTarget.u_surname}" เรียบร้อยแล้ว`);
        setDeleteTarget(null);
        fetchUsers(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถลบผู้ใช้งานได้';
      showToast(message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.u_name.toLowerCase().includes(search.toLowerCase()) ||
      u.u_surname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-950 border border-sky-800/60 text-sky-400">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            เพิ่ม แก้ไข ลบผู้ใช้งาน และกำหนดสิทธิ์ระหว่างช่างเทคนิคและผู้ดูแลระบบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-400' : ''}`} />
            <span>{refreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มผู้ใช้งานใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ทั้งหมด ({usersList.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'admin'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ผู้ดูแลระบบ
          </button>
          <button
            onClick={() => setRoleFilter('technician')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              roleFilter === 'technician'
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ช่างเทคนิคประจำศูนย์
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ, username, อีเมล..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div
        key={flashKey}
        className={`rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden ${
          flashKey > 0 ? 'animate-refresh-flash' : ''
        }`}
      >
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            กำลังโหลดรายชื่อผู้ใช้งาน...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            ไม่พบผู้ใช้งานตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-800">
              {filteredUsers.map((u) => {
                const isCurrent = u.u_id === currentUser?.u_id;
                return (
                  <div key={u.u_id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">#{u.u_id}</span>
                          <p className="font-bold text-slate-100 text-sm">
                            {u.u_name} {u.u_surname}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/50">
                              คุณ
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">@{u.username}</p>
                      </div>

                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          <Shield className="w-3 h-3 text-indigo-400" />
                          <span>ผู้ดูแลระบบ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
                          <UserCheck className="w-3 h-3 text-sky-400" />
                          <span>ช่างเทคนิค</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3 text-emerald-400" />
                        <span className="font-mono">{u.cel}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-sky-400" />
                        <span className="truncate">{u.email}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        disabled={isCurrent}
                        onClick={() => setDeleteTarget(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                          isCurrent
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                            : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-16">รหัส</th>
                    <th className="py-3 px-4 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="py-3 px-4 font-semibold">ชื่อผู้ใช้ (Username)</th>
                    <th className="py-3 px-4 font-semibold">สิทธิ์การใช้งาน</th>
                    <th className="py-3 px-4 font-semibold">เบอร์โทรศัพท์</th>
                    <th className="py-3 px-4 font-semibold">อีเมล</th>
                    <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isCurrent = u.u_id === currentUser?.u_id;
                    return (
                      <tr key={u.u_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">#{u.u_id}</td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-100 text-sm">
                              {u.u_name} {u.u_surname}
                            </p>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/50">
                                คุณ
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-slate-300">
                          @{u.username}
                        </td>

                        <td className="py-3 px-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                              <Shield className="w-3 h-3 text-indigo-400" />
                              <span>ผู้ดูแลระบบ</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/60">
                              <UserCheck className="w-3 h-3 text-sky-400" />
                              <span>ช่างเทคนิคประจำศูนย์</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">{u.cel}</td>

                        <td className="py-3 px-4 text-slate-400">{u.email}</td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(u)}
                              title="แก้ไขข้อมูลผู้ใช้"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              disabled={isCurrent}
                              onClick={() => setDeleteTarget(u)}
                              title={isCurrent ? 'ไม่สามารถลบบัญชีของตัวเองได้' : 'ลบผู้ใช้'}
                              className={`p-2 rounded-xl transition-colors ${
                                isCurrent
                                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                                  : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL: ADD / EDIT USER (Click outside to close) */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl relative animate-modal max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-bold text-white">
                {editingUser
                  ? `แก้ไขข้อมูลผู้ใช้งาน: @${editingUser.username}`
                  : 'เพิ่มผู้ใช้งานใหม่'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">ชื่อผู้ใช้ (Username) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="เช่น tech_somchai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 disabled:opacity-50 disabled:bg-slate-900 focus:outline-none focus:border-sky-500"
                  />
                  {editingUser && (
                    <span className="text-[10px] text-slate-500">Username ไม่สามารถเปลี่ยนได้</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">
                    {editingUser ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่าน (Password) *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={form.pwd}
                    onChange={(e) => setForm({ ...form, pwd: e.target.value })}
                    placeholder={editingUser ? 'กรอกเมื่อต้องการเปลี่ยน' : 'รหัสผ่านอย่างน้อย 4 ตัว'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">ชื่อจริง *</label>
                  <input
                    type="text"
                    required
                    value={form.u_name}
                    onChange={(e) => setForm({ ...form, u_name: e.target.value })}
                    placeholder="เช่น สมชาย"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={form.u_surname}
                    onChange={(e) => setForm({ ...form, u_surname: e.target.value })}
                    placeholder="เช่น ช่างซ่อม"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">สิทธิ์การใช้งาน *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.role === 'technician'
                        ? 'bg-sky-950/60 border-sky-600/80 ring-1 ring-sky-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="technician"
                      checked={form.role === 'technician'}
                      onChange={() => setForm({ ...form, role: 'technician' })}
                      className="mt-0.5 text-sky-500 focus:ring-sky-500"
                    />
                    <div>
                      <p
                        className={`font-bold ${
                          form.role === 'technician' ? 'text-sky-300' : 'text-slate-300'
                        }`}
                      >
                        ช่างเทคนิค (Technician)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        จัดการคิวงานซ่อม และดูประวัติการซ่อม (ไม่เห็นหน้าภาพรวมรายรับ)
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.role === 'admin'
                        ? 'bg-indigo-950/60 border-indigo-600/80 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={form.role === 'admin'}
                      onChange={() => setForm({ ...form, role: 'admin' })}
                      className="mt-0.5 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <p
                        className={`font-bold ${
                          form.role === 'admin' ? 'text-indigo-300' : 'text-slate-300'
                        }`}
                      >
                        ผู้ดูแลระบบ (Admin)
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        เข้าถึงได้ทุกส่วน รวมถึงภาพรวมรายรับและการมอบหมายงานให้ช่าง
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    value={form.cel}
                    onChange={handlePhoneChange}
                    placeholder="0xx-xxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">อีเมล *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="technician@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting
                    ? 'กำลังบันทึก...'
                    : editingUser
                    ? 'บันทึกการแก้ไข'
                    : 'เพิ่มผู้ใช้งาน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Click outside to close + Red Delete Button) */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-backdrop"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl animate-modal"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/70 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ยืนยันการลบผู้ใช้งาน?</h3>
              <p className="text-xs text-slate-400 mt-1">
                ต้องการลบคุณ "{deleteTarget.u_name} {deleteTarget.u_surname}" (@
                {deleteTarget.username}) หรือไม่?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
