import { z } from "zod";

export const createFavoriteSchema = z.object({
  body: z.object({
    contentId: z.string().cuid("Content ID must be a valid cuid"),
  }),
});

export const favoriteIdSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});
