export interface AuthUserPayload {
  u_id: number;
  username: string;
  role: string; // 'admin' | 'technician'
  u_name: string;
  u_surname: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
