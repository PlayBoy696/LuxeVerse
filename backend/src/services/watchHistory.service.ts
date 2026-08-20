import { AppError } from "../utils/AppError.js";
import * as watchHistoryRepository from "../repositories/watchHistory.repository.js";
import * as contentRepository from "../repositories/content.repository.js";

export const getAllWatchHistory = (userId: string) => {
  return watchHistoryRepository.findAllWatchHistoryByUser(userId);
};

export const createWatchHistory = async (userId: string, contentId: string) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  const existing = await watchHistoryRepository.findWatchHistoryByUserAndContent(
    userId,
    contentId
  );

  if (existing) {
    return watchHistoryRepository.updateWatchHistory(existing.id);
  }

  return watchHistoryRepository.createWatchHistory({ userId, contentId });
};

export const deleteWatchHistory = async (
  userId: string,
  isAdmin: boolean,
  id: string
) => {
  const history = await watchHistoryRepository.findWatchHistoryById(id);

  if (!history) {
    throw new AppError("Watch history item not found", 404);
  }

  if (!isAdmin && history.userId !== userId) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  return watchHistoryRepository.deleteWatchHistory(id);
};

export const clearAllWatchHistory = async (userId: string) => {
  return watchHistoryRepository.deleteAllWatchHistoryByUser(userId);
};
