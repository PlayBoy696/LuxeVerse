import type { Prisma } from "@prisma/client";

import { AppError } from "../utils/AppError.js";
import {
  deleteCloudinaryImageByUrl,
  deleteCloudinaryVideoByUrl,
  getCloudinaryPublicId,
} from "../lib/cloudinary.js";
import * as categoryRepository from "../repositories/category.repository.js";
import * as contentRepository from "../repositories/content.repository.js";
import * as tagRepository from "../repositories/tag.repository.js";

type CreateContentInput = {
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  videoUrl: string;
  categoryId: string;
  tagIds?: string[];
};

type ContentListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tag?: string;
  sort?: "newest" | "oldest" | "title-asc" | "title-desc";
};

const cleanupCloudinaryMedia = async (
  url: string | null | undefined,
  resourceType: "image" | "video"
) => {
  const publicId = getCloudinaryPublicId(url, resourceType);

  if (!publicId) {
    return;
  }

  try {
    if (resourceType === "image") {
      await deleteCloudinaryImageByUrl(url);
    } else {
      await deleteCloudinaryVideoByUrl(url);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Cloudinary media cleanup failed", {
      resourceType,
      publicId,
      message,
    });
  }
};

export const getAllContents = async (query: ContentListQuery = {}) => {
  const page = Math.max(1, Number(query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit ?? 20)));
  const sort = query.sort ?? "newest";
  const search = typeof query.search === "string" ? query.search.trim() : undefined;
  const category = typeof query.category === "string" ? query.category.trim() : undefined;
  const tag = typeof query.tag === "string" ? query.tag.trim() : undefined;

  const [items, total] = await contentRepository.findAllContents({
    page,
    limit,
    search,
    category,
    tag,
    sort,
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

export const getContentById = async (id: string) => {
  const content = await contentRepository.findContentById(id);

  if (!content) {
    throw new AppError("Content not found", 404);
  }

  return content;
};

export const createContent = async ({
  title,
  slug,
  description,
  thumbnail,
  videoUrl,
  categoryId,
  tagIds = [],
}: CreateContentInput) => {
  const existingBySlug = await contentRepository.findContentBySlug(slug);

  if (existingBySlug) {
    throw new AppError("Content slug already exists", 409);
  }

  const category = await categoryRepository.findCategoryById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  const uniqueTagIds = Array.from(new Set(tagIds));

  for (const tagId of uniqueTagIds) {
    const tag = await tagRepository.findTagById(tagId);

    if (!tag) {
      throw new AppError("Tag not found", 404);
    }
  }

  const data: Prisma.ContentCreateInput = {
    title,
    slug,
    description,
    thumbnail,
    videoUrl,
    category: {
      connect: {
        id: categoryId,
      },
    },
    tags: {
      create: uniqueTagIds.map((tagId) => ({
        tag: {
          connect: {
            id: tagId,
          },
        },
      })),
    },
  };

  return contentRepository.createContent(data);
};

export const updateContent = async (
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string;
    thumbnail?: string | null;
    videoUrl?: string;
    categoryId?: string;
    tagIds?: string[];
  }
) => {
  const existingContent = await contentRepository.findContentById(id);

  if (!existingContent) {
    throw new AppError("Content not found", 404);
  }

  if (data.slug && data.slug !== existingContent.slug) {
    const existingBySlug = await contentRepository.findContentBySlug(
      data.slug
    );

    if (existingBySlug) {
      throw new AppError("Content slug already exists", 409);
    }
  }

  if (data.categoryId) {
    const category = await categoryRepository.findCategoryById(
      data.categoryId
    );

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const tagIds = data.tagIds;
  const uniqueTagIds = tagIds ? Array.from(new Set(tagIds)) : undefined;

  if (uniqueTagIds) {
    for (const tagId of uniqueTagIds) {
      const tag = await tagRepository.findTagById(tagId);

      if (!tag) {
        throw new AppError("Tag not found", 404);
      }
    }
  }

  const updateData: Prisma.ContentUpdateInput = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    thumbnail: data.thumbnail,
    videoUrl: data.videoUrl,
    category: data.categoryId
      ? {
          connect: {
            id: data.categoryId,
          },
        }
      : undefined,
  };

  const updatedContent = await contentRepository.updateContent(
    id,
    updateData,
    uniqueTagIds
  );

  if (data.thumbnail !== undefined && data.thumbnail !== existingContent.thumbnail) {
    await cleanupCloudinaryMedia(existingContent.thumbnail, "image");
  }

  if (data.videoUrl !== undefined && data.videoUrl !== existingContent.videoUrl) {
    await cleanupCloudinaryMedia(existingContent.videoUrl, "video");
  }

  return updatedContent;
};

export const deleteContent = async (id: string) => {
  const existingContent = await contentRepository.findContentById(id);

  if (!existingContent) {
    throw new AppError("Content not found", 404);
  }

  const deletedContent = await contentRepository.deleteContent(id);

  await cleanupCloudinaryMedia(existingContent.thumbnail, "image");
  await cleanupCloudinaryMedia(existingContent.videoUrl, "video");

  return deletedContent;
};
