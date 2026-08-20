import { AppError } from "../utils/AppError.js";
import * as likeRepository from "../repositories/like.repository.js";
import * as contentRepository from "../repositories/content.repository.js";

export const getAllLikes = (userId: string) => {
  return likeRepository.findAllLikesByUser(userId);
};

export const getLikeCountByContent = async (contentId: string) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  const count = await likeRepository.countLikesByContent(contentId);

  return {
    contentId,
    count,
  };
};

export const getLikeStatusByContent = async (userId: string, contentId: string) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  const existing = await likeRepository.findLikeByUserAndContent(userId, contentId);

  return {
    liked: Boolean(existing),
  };
};

export const getLikeById = async (userId: string, isAdmin: boolean, id: string) => {
  const like = await likeRepository.findLikeById(id);

  if (!like) {
    throw new AppError("Like not found", 404);
  }

  if (!isAdmin && like.userId !== userId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }

  return like;
};

export const createLike = async (userId: string, contentId: string) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  const existing = await likeRepository.findLikeByUserAndContent(userId, contentId);

  if (existing) {
    throw new AppError("Like already exists", 409);
  }

  return likeRepository.createLike({ userId, contentId });
};

export const deleteLike = async (userId: string, isAdmin: boolean, id: string) => {
  const like = await likeRepository.findLikeById(id);

  if (!like) {
    throw new AppError("Like not found", 404);
  }

  if (!isAdmin && like.userId !== userId) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  return likeRepository.deleteLike(id);
};
