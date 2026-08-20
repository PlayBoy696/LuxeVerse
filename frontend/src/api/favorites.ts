import { api } from './client.js';
import type { ApiResponse } from '../types/api.js';

export interface Favorite {
  id: string;
  userId: string;
  contentId: string;
  content?: any;
}

export const getFavorites = async (): Promise<ApiResponse<Favorite[]>> => {
  return api.get('/favorites');
};

export const createFavorite = async (contentId: string): Promise<ApiResponse<Favorite>> => {
  return api.post('/favorites', { contentId });
};

export const deleteFavorite = async (favoriteId: string): Promise<{ success: boolean; message?: string }> => {
  return api.del(`/favorites/${favoriteId}`);
};
