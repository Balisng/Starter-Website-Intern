import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import type { User } from '../types';

/**
 * Authentication Context
 * จัดการ State การเข้าสู่ระบบ, ผู้ใช้งานปัจจุบัน (User), และ Session ผ่าน HttpOnly Cookie
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pwd: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ตรวจสอบสถานะการล็อกอินอัตโนมัติจาก Cookie ด้วย GET /api/auth/me
  const checkAuth = async () => {
    try {
      const res = await apiRequest<{ user: User }>('/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username: string, pwd: string): Promise<User> => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, pwd }),
    });

    if (res.success && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'เข้าสู่ระบบไม่สำเร็จ');
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
