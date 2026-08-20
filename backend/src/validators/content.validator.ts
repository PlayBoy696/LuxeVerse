import { z } from "zod";

export const listContentsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(200).optional(),
    category: z.string().trim().max(100).optional(),
    tag: z.string().trim().max(100).optional(),
    sort: z
      .enum(["newest", "oldest", "title-asc", "title-desc"])
      .default("newest"),
  }),
});

export const createContentSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title is too long"),
    slug: z
      .string()
      .trim()
      .min(2, "Slug must be at least 2 characters")
      .max(200, "Slug is too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug may only contain lowercase letters, numbers and hyphens"
      ),
    description: z
      .string()
      .trim()
      .min(1, "Description must be at least 1 character")
      .max(5000, "Description is too long"),
    thumbnail: z.string().trim().max(2048).url("Thumbnail must be a valid URL").optional().nullable(),
    videoUrl: z
      .string()
      .trim()
      .max(2048)
      .url("Video URL must be a valid URL"),
    categoryId: z.string().cuid("Category ID must be a valid cuid"),
    tagIds: z
      .array(z.string().cuid("Tag ID must be a valid cuid"))
      .optional()
      .default([]),
  }),
});

export const updateContentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200).optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(200)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    thumbnail: z.string().trim().max(2048).url().optional().nullable(),
    videoUrl: z.string().trim().max(2048).url().optional(),
    categoryId: z.string().cuid().optional(),
    tagIds: z.array(z.string().cuid()).optional(),
  }),
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const contentIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
