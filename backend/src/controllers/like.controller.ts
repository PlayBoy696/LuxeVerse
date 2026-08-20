import type { Request, Response } from "express";
import { Role } from "@prisma/client";

import * as likeService from "../services/like.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type LikeParams = {
  id: string;
};

type ContentLikeParams = {
  contentId: string;
};

export const getAllLikes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const likes = await likeService.getAllLikes(userId);

  res.status(200).json({ success: true, data: likes });
});

export const getLikeCountByContent = asyncHandler(async (req: Request<ContentLikeParams>, res: Response) => {
  const { contentId } = req.params;

  const result = await likeService.getLikeCountByContent(contentId);

  res.status(200).json({ success: true, data: result });
});

export const getLikeStatusByContent = asyncHandler(async (req: Request<ContentLikeParams>, res: Response) => {
  const userId = req.user!.id;
  const { contentId } = req.params;

  const result = await likeService.getLikeStatusByContent(userId, contentId);

  res.status(200).json({ success: true, data: result });
});

export const getLikeById = asyncHandler(async (req: Request<LikeParams>, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === Role.ADMIN;

  const like = await likeService.getLikeById(userId, isAdmin, req.params.id);

  res.status(200).json({ success: true, data: like });
});

export const createLike = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { contentId } = req.body;

  const like = await likeService.createLike(userId, contentId);

  res.status(201).json({ success: true, data: like });
});

export const deleteLike = asyncHandler(async (req: Request<LikeParams>, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === Role.ADMIN;

  await likeService.deleteLike(userId, isAdmin, req.params.id);

  res.status(200).json({ success: true, message: "Like deleted successfully" });
});
