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
