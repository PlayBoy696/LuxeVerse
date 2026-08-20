import { api } from './client.js';
import type { ApiResponse, WatchHistoryItem } from '../types/api.js';

export const getWatchHistory = async (): Promise<ApiResponse<WatchHistoryItem[]>> => {
  return api.get('/watch-history');
};

export const addToWatchHistory = async (contentId: string): Promise<ApiResponse<WatchHistoryItem>> => {
  return api.post('/watch-history', { contentId });
};

export const deleteWatchHistoryItem = async (id: string): Promise<{ success: boolean; message?: string }> => {
  return api.del(`/watch-history/${id}`);
};

export const clearWatchHistory = async (): Promise<{ success: boolean; message?: string }> => {
  return api.del('/watch-history');
};
