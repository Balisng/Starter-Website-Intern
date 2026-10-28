import React, { createContext, useContext, useState } from 'react';
import type { Service } from '../types';

/**
 * Service Context
 * ใช้ส่งต่อข้อมูลบริการที่ถูกเลือก (Selected Service) จากหน้า Home/Services ไปยังแบบฟอร์ม Contact Us
 */
interface ServiceContextType {
  selectedService: Service | null;
  selectService: (service: Service) => void;
  clearSelectedService: () => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // เลือกบริการเพื่อนำไป pre-select ในหน้า Contact Us
  const selectService = (service: Service) => {
    setSelectedService(service);
  };

  const clearSelectedService = () => {
    setSelectedService(null);
  };

  return (
    <ServiceContext.Provider value={{ selectedService, selectService, clearSelectedService }}>
      {children}
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
