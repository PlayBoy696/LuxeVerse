import type { Request, Response } from "express";

import * as contentService from "../services/content.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type ContentParams = {
  id: string;
};

export const getAllContents = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await contentService.getAllContents({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 20),
      search: typeof req.query.search === "string" ? req.query.search : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      tag: typeof req.query.tag === "string" ? req.query.tag : undefined,
      sort:
        typeof req.query.sort === "string"
          ? (req.query.sort as "newest" | "oldest" | "title-asc" | "title-desc")
          : "newest",
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }
);

export const getContentById = asyncHandler(
  async (req: Request<ContentParams>, res: Response) => {
    const content = await contentService.getContentById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: content,
    });
  }
);

export const createContent = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      slug,
      description,
      thumbnail,
      videoUrl,
      categoryId,
      tagIds,
    } = req.body;

    const content = await contentService.createContent({
      title,
      slug,
      description,
      thumbnail,
      videoUrl,
      categoryId,
      tagIds,
    });

    res.status(201).json({
      success: true,
      data: content,
    });
  }
);

export const updateContent = asyncHandler(
  async (req: Request<ContentParams>, res: Response) => {
    const {
      title,
      slug,
      description,
      thumbnail,
      videoUrl,
      categoryId,
      tagIds,
    } = req.body;

    const content = await contentService.updateContent(
      req.params.id,
      {
        title,
        slug,
        description,
        thumbnail,
        videoUrl,
        categoryId,
        tagIds,
      }
    );

    res.status(200).json({
      success: true,
      data: content,
    });
  }
);

export const deleteContent = asyncHandler(
  async (req: Request<ContentParams>, res: Response) => {
    await contentService.deleteContent(req.params.id);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  }
);
