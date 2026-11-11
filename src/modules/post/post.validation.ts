import {z} from "zod";
import { LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utlis/validation.js";



export const createPost = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        content: generalValidationFields.content(lang),
    }),
    files: z.array(generalValidationFields.file(lang)).max(3).optional()


}).refine((data) => {
    if (!data.body.content && !data.files?.length) return false;
    return true;
  }
, {
    message: "Post must contain content or attachments",
    path: ["body", "content"]
})
}  


export const GetPostById = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        postId: generalValidationFields.id(lang),
    })
})
}  

export const UpdatePost = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        postId: generalValidationFields.id(lang),
    }),
     body:z.strictObject({
        content: generalValidationFields.content(lang),
    }),
    files: z.array(generalValidationFields.file(lang)).max(3).optional()

})
}  

