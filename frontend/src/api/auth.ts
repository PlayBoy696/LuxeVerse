import { api } from './client.js';
import type { LoginInput, RegisterInput } from '../types/auth.js';
import type { AuthResponse } from '../types/auth.js';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/login', { email, password });
};

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  return api.post<AuthResponse>('/auth/register', input);
};

export const refresh = async (): Promise<AuthResponse> => {
  // client already implements refresh handling, but keep a direct call available if needed
  return api.post<AuthResponse>('/auth/refresh');
};

export const logout = async (): Promise<{ success: boolean; message?: string }> => {
  return api.post('/auth/logout');
};

export const me = async (): Promise<AuthResponse> => {
  return api.get<AuthResponse>('/auth/me');
};
