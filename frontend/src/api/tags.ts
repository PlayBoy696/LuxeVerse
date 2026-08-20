import { api } from './client.js';
import type { ApiResponse, Tag } from '../types/api.js';

export const getTags = () =>
  api.get<ApiResponse<Tag[]>>('/tags');

export const getTagById = (id: string) =>
  api.get<ApiResponse<Tag>>(`/tags/${id}`);

export const createTag = async (data: { name: string; slug: string }) =>
  api.post<ApiResponse<Tag>>('/tags', data);

export const updateTag = async (id: string, data: { name?: string; slug?: string }) =>
  api.patch<ApiResponse<Tag>>(`/tags/${id}`, data);

export const deleteTag = async (id: string) =>
  api.del<{ success: boolean; message?: string }>(`/tags/${id}`);
