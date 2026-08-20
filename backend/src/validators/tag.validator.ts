import { z } from "zod";

export const createTagSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Tag name must be at least 2 characters")
      .max(100, "Tag name is too long"),

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

export const updateTagSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Tag name must be at least 2 characters")
      .max(100, "Tag name is too long"),

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

  params: z.object({
    id: z.string().cuid(),
  }),
});

export const tagIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});