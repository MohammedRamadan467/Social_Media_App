import z from "zod";
import { createPost, updatePost } from "../post.validation";

export type CreatePostDto = z.infer<ReturnType<typeof createPost>>
export type updatePostDto = z.infer<ReturnType<typeof updatePost>>
