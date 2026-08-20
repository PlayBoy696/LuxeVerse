import type { Request, Response } from "express";
import { Role } from "@prisma/client";

import * as watchHistoryService from "../services/watchHistory.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type WatchHistoryParams = {
  id: string;
};

export const getAllWatchHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const history = await watchHistoryService.getAllWatchHistory(userId);

    res.status(200).json({ success: true, data: history });
  }
);

export const createWatchHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { contentId } = req.body;

    const historyItem = await watchHistoryService.createWatchHistory(
      userId,
      contentId
    );

    res.status(201).json({ success: true, data: historyItem });
  }
);

export const deleteWatchHistory = asyncHandler(
  async (req: Request<WatchHistoryParams>, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === Role.ADMIN;

    await watchHistoryService.deleteWatchHistory(userId, isAdmin, req.params.id);

    res.status(200).json({ success: true, message: "Watch history item deleted successfully" });
  }
);

export const clearAllWatchHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await watchHistoryService.clearAllWatchHistory(userId);

    res.status(200).json({ success: true, message: "Watch history cleared successfully" });
  }
);
