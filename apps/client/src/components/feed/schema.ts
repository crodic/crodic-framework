import { z } from "zod";

export const createFeedCommentSchema = (errorMsg: string) =>
  z.object({
    comment: z.string().min(1, errorMsg),
  });

export type FeedCommentFormValues = z.infer<
  ReturnType<typeof createFeedCommentSchema>
>;
