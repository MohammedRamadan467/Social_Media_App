import z from "zod";
import { createPost } from "../post.validation";
import { IUser } from "../../../common/interface";

export type CreatePostDto = z.infer<ReturnType<typeof createPost>>['body'] & {attachments?:string[]}
