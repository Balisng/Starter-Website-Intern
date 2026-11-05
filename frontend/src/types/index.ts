// ==========================================
// 1. Category Types
// ==========================================
export interface Category {
  cg_id: number;
  cg_name: string;
}

// ==========================================
// 2. Service Types
// ==========================================
export interface Service {
  id: number;
  cg_id: number;
  cg_name?: string | null;
  name: string;
  detail: string;
  price: number;
  status: boolean;
  service_image: string;
}

// ==========================================
// 3. User & Auth Types
// ==========================================
export type UserRole = 'admin' | 'technician';

export interface User {
  u_id: number;
  username: string;
  u_name: string;
  u_surname: string;
  role: UserRole;
  cel: string;
  email: string;
}

// ==========================================
// 4. Inbox / Repair Request Types
// ==========================================
export type RepairStatus = 'pending' | 'in_progress' | 'completed';

export interface InboxMessage {
  cm_id: number;
  service_id: number | null;
  service_name?: string | null;
  service_price?: number | null;
  final_price?: number | null;
  completed_at?: string | null;
  service_image?: string | null;
  category_id?: number | null;
  category_name?: string | null;
  technician_id?: number | null;
  technician_name?: string | null;
  technician_surname?: string | null;
  cm_username: string;
  cm_cel: string;
  cm_email: string;
  cm_symptom: string;
  cm_image?: string | null;
  is_read: boolean;
  repair_status: RepairStatus;
  comment?: string | null;
  created_at: string;
}

// ==========================================
// 5. Dashboard Statistics Types
// ==========================================
export interface TechnicianJobItem {
  cm_id: number;
  technician_id: number | null;
  cm_username: string;
  cm_cel: string;
  cm_symptom: string;
  service_id: number | null;
  service_name: string | null;
  service_price: number;
  repair_status: RepairStatus;
  created_at: string;
  completed_at?: string | null;
}

export interface TechnicianPerformance {
  u_id: number;
  u_name: string;
  u_surname: string;
  username: string;
  cel: string;
  email: string;
  pendingCount: number;
  completedCount: number;
  totalJobsCount: number;
  totalRevenue: number;
  jobs: TechnicianJobItem[];
}

export interface DashboardData {
  period?: 'all' | 'weekly' | 'monthly';
  summary: {
    totalRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    periodRevenue: number;
    periodCompletedCount: number;
    periodPendingCount: number;
    completedRepairsCount: number;
    pendingRepairsCount: number;
    techniciansCount: number;
  };
  categoryStats: {
    category_name: string | null;
    count: number;
    revenue: number;
  }[];
  recentActivities: {
    cm_id: number;
    cm_username: string;
    service_name: string | null;
    price: number;
    repair_status: RepairStatus;
    technician_name?: string | null;
    technician_surname?: string | null;
    created_at: string;
    completed_at?: string | null;
  }[];
  technicianPerformance: TechnicianPerformance[];
}

// ==========================================
// 6. Standard API Response Wrapper
// ==========================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
  errors?: { field: string; message: string }[];
}
