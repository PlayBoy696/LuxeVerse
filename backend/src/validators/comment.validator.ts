import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    contentId: z.string().cuid("Content ID must be a valid cuid"),
    body: z
      .string()
      .trim()
      .min(1, "Comment body is required")
      .max(2000, "Comment body is too long"),
  }),
});

export const commentIdSchema = z.object({
  params: z.object({
    id: z.string().cuid("Comment ID must be a valid cuid"),
  }),
});

export const contentCommentSchema = z.object({
  params: z.object({
    contentId: z.string().cuid("Content ID must be a valid cuid"),
  }),
});
