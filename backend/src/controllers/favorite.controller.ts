import type { Request, Response } from "express";
import { Role } from "@prisma/client";

import * as favoriteService from "../services/favorite.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type FavoriteParams = {
  id: string;
};

export const getAllFavorites = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const favorites = await favoriteService.getAllFavorites(userId);

    res.status(200).json({ success: true, data: favorites });
  }
);

export const getFavoriteById = asyncHandler(
  async (req: Request<FavoriteParams>, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === Role.ADMIN;

    const favorite = await favoriteService.getFavoriteById(
      userId,
      isAdmin,
      req.params.id
    );

    res.status(200).json({ success: true, data: favorite });
  }
);

export const createFavorite = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { contentId } = req.body;

    const favorite = await favoriteService.createFavorite(
      userId,
      contentId
    );

    res.status(201).json({ success: true, data: favorite });
  }
);

export const deleteFavorite = asyncHandler(
  async (req: Request<FavoriteParams>, res: Response) => {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === Role.ADMIN;

    await favoriteService.deleteFavorite(
      userId,
      isAdmin,
      req.params.id
    );

    res.status(200).json({ success: true, message: "Favorite deleted successfully" });
  }
);
