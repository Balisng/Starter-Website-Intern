export interface Category {
  cg_id: number;
  cg_name: string;
}

export interface Service {
  id: number;
  cg_id: number;
  cg_name?: string;
  name: string;
  detail: string;
  price: number;
  status: boolean;
  service_image: string;
}

export interface User {
  u_id: number;
  username: string;
  u_name: string;
  u_surname: string;
  role: 'admin' | 'technician';
  cel: string;
  email: string;
}

export interface InboxMessage {
  cm_id: number;
  service_id: number | null;
  service_name?: string;
  service_price?: number;
  service_image?: string;
  category_id?: number;
  category_name?: string;
  technician_id?: number | null;
  technician_name?: string | null;
  technician_surname?: string | null;
  cm_username: string;
  cm_cel: string;
  cm_email: string;
  cm_symptom: string;
  cm_image?: string | null;
  is_read: boolean;
  repair_status: 'pending' | 'completed';
  comment?: string | null;
  created_at: string;
}

export interface TechnicianJob {
  cm_id: number;
  technician_id: number | null;
  cm_username: string;
  cm_cel: string;
  cm_symptom: string;
  service_id: number | null;
  service_name: string | null;
  service_price: number;
  repair_status: 'pending' | 'completed';
  created_at: string;
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
  jobs: TechnicianJob[];
}

export interface DashboardSummary {
  totalRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  periodRevenue: number;
  periodCompletedCount: number;
  periodPendingCount: number;
  completedRepairsCount: number;
  pendingRepairsCount: number;
  techniciansCount: number;
}

export interface CategoryStat {
  category_name: string;
  count: number;
  revenue: number;
}

export interface RecentActivity {
  cm_id: number;
  cm_username: string;
  service_name: string;
  price: number;
  repair_status: 'pending' | 'completed';
  technician_name?: string | null;
  technician_surname?: string | null;
  created_at: string;
}

export interface DashboardData {
  period: 'all' | 'weekly' | 'monthly';
  summary: DashboardSummary;
  categoryStats: CategoryStat[];
  recentActivities: RecentActivity[];
  technicianPerformance: TechnicianPerformance[];
}

