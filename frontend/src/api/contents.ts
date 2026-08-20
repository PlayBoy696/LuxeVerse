import { api } from './client.js';
import type { ApiResponse, Content, PaginatedResponse } from '../types/api.js';

export type ContentListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  sort?: 'newest' | 'oldest' | 'title-asc' | 'title-desc';
};

export type ContentInput = {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  videoUrl: string;
  categoryId: string;
  tagIds?: string[];
};

export const getContents = (params?: ContentListParams) => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value));
      }
    });
  }

  const query = searchParams.toString();

  return api.get<PaginatedResponse<Content>>(`/contents${query ? `?${query}` : ''}`);
};

export const getContentById = (id: string) =>
  api.get<{ success: true; data: Content }>(`/contents/${id}`);

export const createContent = async (data: ContentInput) =>
  api.post<ApiResponse<Content>>('/contents', data);

export const updateContent = async (id: string, data: Partial<ContentInput>) =>
  api.patch<ApiResponse<Content>>(`/contents/${id}`, data);

export const deleteContent = async (id: string) =>
  api.del<{ success: boolean; message?: string }>(`/contents/${id}`);
