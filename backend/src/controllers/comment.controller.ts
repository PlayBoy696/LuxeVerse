import type { Request, Response } from "express";
import { Role } from "@prisma/client";

import * as commentService from "../services/comment.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type CommentParams = {
  id: string;
};

type ContentCommentParams = {
  contentId: string;
};

export const getCommentsByContent = asyncHandler(
  async (req: Request<ContentCommentParams>, res: Response) => {
    const { contentId } = req.params;

    const comments = await commentService.getCommentsByContent(contentId);

    res.status(200).json({ success: true, data: comments });
  }
);

export const getCommentById = asyncHandler(
  async (req: Request<CommentParams>, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === Role.ADMIN;

    const comment = await commentService.getCommentById(
      userId,
      isAdmin,
      req.params.id
    );

    res.status(200).json({ success: true, data: comment });
  }
);

export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { contentId, body } = req.body;

    const comment = await commentService.createComment(
      userId,
      contentId,
      body
    );

    res.status(201).json({ success: true, data: comment });
  }
);

export const deleteComment = asyncHandler(
  async (req: Request<CommentParams>, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === Role.ADMIN;

    await commentService.deleteComment(userId, isAdmin, req.params.id);

    res.status(200).json({ success: true, message: "Comment deleted successfully" });
  }
);
