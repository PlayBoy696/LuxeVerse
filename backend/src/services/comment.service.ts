import { AppError } from "../utils/AppError.js";
import * as commentRepository from "../repositories/comment.repository.js";
import * as contentRepository from "../repositories/content.repository.js";

export const getCommentsByContent = async (contentId: string) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  return commentRepository.findCommentsByContent(contentId);
};

export const getCommentById = async (
  userId: string,
  isAdmin: boolean,
  id: string
) => {
  const comment = await commentRepository.findCommentById(id);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (!isAdmin && comment.userId !== userId) {
    throw new AppError("You do not have permission to access this resource", 403);
  }

  return comment;
};

export const createComment = async (
  userId: string,
  contentId: string,
  body: string
) => {
  const content = await contentRepository.findContentById(contentId);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  const normalizedBody = body.trim();

  if (!normalizedBody) {
    throw new AppError("Comment body is required", 400);
  }

  return commentRepository.createComment({
    userId,
    contentId,
    body: normalizedBody,
  });
};

export const deleteComment = async (
  userId: string,
  isAdmin: boolean,
  id: string
) => {
  const comment = await commentRepository.findCommentById(id);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (!isAdmin && comment.userId !== userId) {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  return commentRepository.deleteComment(id);
};
