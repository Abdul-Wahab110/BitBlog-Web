import { Request } from 'express';

export type UserRole = 'Admin' | 'Editor' | 'Author' | 'User';

export interface JwtPayload {
  userId: number;
  email: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export interface HealthStatus {
  status: 'UP' | 'DOWN';
  environment: string;
  database: 'CONNECTED' | 'DISCONNECTED';
  uptimeSeconds: number;
  timestamp: string;
}
