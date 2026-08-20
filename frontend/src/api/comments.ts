import { api } from './client.js';
import type { ApiResponse, Comment } from '../types/api.js';

export const getCommentsByContent = async (contentId: string): Promise<ApiResponse<Comment[]>> => {
  return api.get(`/comments/content/${contentId}`);
};

export const createComment = async (contentId: string, body: string): Promise<ApiResponse<Comment>> => {
  return api.post('/comments', { contentId, body });
};

export const deleteComment = async (commentId: string): Promise<{ success: boolean; message?: string }> => {
  return api.del(`/comments/${commentId}`);
};
