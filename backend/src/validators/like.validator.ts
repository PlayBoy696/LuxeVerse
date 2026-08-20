import { z } from "zod";

export const createLikeSchema = z.object({
  body: z.object({
    contentId: z.string().cuid("Content ID must be a valid cuid"),
  }),
});

export const contentIdParamSchema = z.object({
  params: z.object({
    contentId: z.string().cuid("Content ID must be a valid cuid"),
  }),
});

export const likeIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
