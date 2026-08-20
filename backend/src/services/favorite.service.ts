import { Role } from "@prisma/client";

import { AppError } from "../utils/AppError.js";
import * as favoriteRepository from "../repositories/favorite.repository.js";
import * as contentRepository from "../repositories/content.repository.js";

export const getAllFavorites = (userId: string) => {
  return favoriteRepository.findAllFavoritesByUser(userId);
};

export const getFavoriteById = async (
  userId: string,
  isAdmin: boolean,
  id: string
) => {
  const favorite = await favoriteRepository.findFavoriteById(id);

  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }

  if (!isAdmin && favorite.userId !== userId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }

  return favorite;
};

export const createFavorite = async (
  userId: string,
  contentId: string
) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  const existing = await favoriteRepository.findFavoriteByUserAndContent(
    userId,
    contentId
  );

  if (existing) {
    throw new AppError("Favorite already exists", 409);
  }

  return favoriteRepository.createFavorite({ userId, contentId });
};

export const deleteFavorite = async (
  userId: string,
  isAdmin: boolean,
  id: string
) => {
  const favorite = await favoriteRepository.findFavoriteById(id);

  if (!favorite) {
    throw new AppError("Favorite not found", 404);
  }

  if (!isAdmin && favorite.userId !== userId) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  return favoriteRepository.deleteFavorite(id);
};
