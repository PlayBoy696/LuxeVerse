export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string | null;
  role: Role;
  isVerified: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse<T = User> {
  success: boolean;
  message?: string;
  data: {
    user: T;
    accessToken?: string;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  username: string;
}
