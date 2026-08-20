import type { Request, Response } from "express";

import * as categoryService from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

type CategoryParams = {
  id: string;
};

export const getAllCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories =
      await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  }
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, slug } = req.body;

    const category =
      await categoryService.createCategory(name, slug);

    res.status(201).json({
      success: true,
      data: category,
    });
  }
);

export const updateCategory = asyncHandler(
  async (
    req: Request<CategoryParams>,
    res: Response
  ) => {
    const { name, slug } = req.body;

    const category =
      await categoryService.updateCategory(
        req.params.id,
        name,
        slug
      );

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

export const getCategoryById = asyncHandler(
  async (
    req: Request<CategoryParams>,
    res: Response
  ) => {
    const category =
      await categoryService.getCategoryById(req.params.id);

    res.status(200).json({
      success: true,
      data: category,
    });
  }
);

export const deleteCategory = asyncHandler(
  async (
    req: Request<CategoryParams>,
    res: Response
  ) => {
    await categoryService.deleteCategory(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  }
);