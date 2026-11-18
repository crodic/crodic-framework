import { z } from "zod";

export const createPostCommentSchema = (errorMessage: string) =>
  z.object({
    comment: z.string().min(1, errorMessage),
  });

export type PostCommentFormValues = z.infer<
  ReturnType<typeof createPostCommentSchema>
>;
