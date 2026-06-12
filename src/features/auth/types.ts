export type UserRole = 'CUSTOMER' | 'CONTENT_ADMIN' | 'SYSTEM_ADMIN';

export interface AuthUser {
  uid: string;
  userName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  uid: string;
  userName: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
