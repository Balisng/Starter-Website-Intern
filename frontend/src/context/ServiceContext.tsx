import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { apiRequest } from '../api/client';
import type { Category, Service } from '../types';

export type ToastType = 'success' | 'info' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ServiceContextType {
  selectedService: Service | null;
  selectService: (service: Service) => void;
  clearSelectedService: () => void;
  categories: Category[];
  services: Service[];
  catalogLoading: boolean;
  refreshCatalog: (forceFresh?: boolean) => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

const STORAGE_CATEGORIES_KEY = 'fixplease_categories_cache_v1';
const STORAGE_SERVICES_KEY = 'fixplease_services_cache_v1';

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Instant hydration from sessionStorage so navigating pages on Vercel has 0ms wait
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_CATEGORIES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_SERVICES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [catalogLoading, setCatalogLoading] = useState<boolean>(() => {
    return services.length === 0;
  });

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshCatalog = useCallback(async (forceFresh: boolean = false) => {
    if (services.length === 0 || forceFresh) {
      setCatalogLoading(true);
    }
    try {
      const params: Record<string, string | number | boolean> = {};
      if (forceFresh) params.fresh = 1;

      const [catRes, srvRes] = await Promise.all([
        apiRequest<Category[]>('/categories', { params }),
        apiRequest<Service[]>('/services', { params: { ...params, status: true } }),
      ]);

      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        try {
          sessionStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(catRes.data));
        } catch {}
      }

      if (srvRes.success && srvRes.data) {
        setServices(srvRes.data);
        try {
          sessionStorage.setItem(STORAGE_SERVICES_KEY, JSON.stringify(srvRes.data));
        } catch {}
      }
    } catch (err) {
      console.error('Error preloading catalog:', err);
    } finally {
      setCatalogLoading(false);
    }
  }, [services.length]);

  useEffect(() => {
    refreshCatalog(false);
  }, []);

  const selectService = (service: Service) => {
    setSelectedService(service);
  };

  const clearSelectedService = () => {
    setSelectedService(null);
  };

  return (
    <ServiceContext.Provider
      value={{
        selectedService,
        selectService,
        clearSelectedService,
        categories,
        services,
        catalogLoading,
        refreshCatalog,
        showToast,
      }}
    >
      {children}

      {/* Global Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-auto pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-fade ${
                t.type === 'error'
                  ? 'bg-red-600 text-white border-red-500'
                  : t.type === 'info'
                  ? 'bg-slate-900 text-white border-slate-700'
                  : 'bg-emerald-600 text-white border-emerald-500'
              }`}
            >
              {t.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-100 shrink-0" />
              ) : t.type === 'info' ? (
                <Info className="w-4 h-4 text-sky-300 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
              )}
              <span className="leading-snug flex-1">{t.message}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="p-0.5 rounded hover:bg-black/15 text-white/80 hover:text-white cursor-pointer shrink-0"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
