import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name is too long"),

    slug: z
      .string()
      .trim()
      .min(2, "Slug must be at least 2 characters")
      .max(100, "Slug is too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug may only contain lowercase letters, numbers and hyphens"
      ),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100),

    slug: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9-]+$/),
  }),

  params: z.object({
    id: z.string().cuid(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});