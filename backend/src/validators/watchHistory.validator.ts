import { z } from "zod";

export const createWatchHistorySchema = z.object({
  body: z.object({
    contentId: z.string().cuid("Content ID must be a valid cuid"),
  }),
});

export const watchHistoryIdSchema = z.object({
  params: z.object({
    id: z.string().cuid("Watch history item ID must be a valid cuid"),
  }),
});
