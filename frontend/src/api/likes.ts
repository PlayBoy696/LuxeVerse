import { api } from './client.js';
import type { ApiResponse } from '../types/api.js';

export interface Like {
  id: string;
  userId: string;
  contentId: string;
  content?: any;
}

export const getLikes = async (): Promise<ApiResponse<Like[]>> => {
  return api.get('/likes');
};

export const createLike = async (contentId: string): Promise<ApiResponse<Like>> => {
  return api.post('/likes', { contentId });
};

export const deleteLike = async (likeId: string): Promise<{ success: boolean; message?: string }> => {
  return api.del(`/likes/${likeId}`);
};

export const getLikeCount = async (contentId: string): Promise<ApiResponse<{ contentId: string; count: number }>> => {
  return api.get(`/likes/content/${contentId}/count`);
};

export const getLikeStatus = async (contentId: string): Promise<ApiResponse<{ liked: boolean }>> => {
  return api.get(`/likes/content/${contentId}/status`);
};
