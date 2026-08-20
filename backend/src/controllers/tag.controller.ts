import type { Request, Response } from "express";

import * as tagService from "../services/tag.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type TagParams = {
  id: string;
};

export const getAllTags = asyncHandler(
  async (_req: Request, res: Response) => {
    const tags = await tagService.getAllTags();

    res.status(200).json({
      success: true,
      data: tags,
    });
  }
);

export const getTagById = asyncHandler(
  async (
    req: Request<TagParams>,
    res: Response
  ) => {
    const tag = await tagService.getTagById(req.params.id);

    res.status(200).json({
      success: true,
      data: tag,
    });
  }
);

export const createTag = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, slug } = req.body;

    const tag = await tagService.createTag(
      name,
      slug
    );

    res.status(201).json({
      success: true,
      data: tag,
    });
  }
);

export const updateTag = asyncHandler(
  async (
    req: Request<TagParams>,
    res: Response
  ) => {
    const { name, slug } = req.body;

    const tag = await tagService.updateTag(
      req.params.id,
      name,
      slug
    );

    res.status(200).json({
      success: true,
      data: tag,
    });
  }
);

export const deleteTag = asyncHandler(
  async (
    req: Request<TagParams>,
    res: Response
  ) => {
    await tagService.deleteTag(req.params.id);

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  }
);