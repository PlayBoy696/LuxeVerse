import { api } from './client.js';
import type { ApiResponse, Category } from '../types/api.js';

export const getCategories = () =>
  api.get<ApiResponse<Category[]>>('/categories');

export const getCategoryById = (id: string) =>
  api.get<ApiResponse<Category>>(`/categories/${id}`);

export const createCategory = async (data: { name: string; slug: string }) =>
  api.post<ApiResponse<Category>>('/categories', data);

export const updateCategory = async (id: string, data: { name?: string; slug?: string }) =>
  api.patch<ApiResponse<Category>>(`/categories/${id}`, data);

export const deleteCategory = async (id: string) =>
  api.del<{ success: boolean; message?: string }>(`/categories/${id}`);
