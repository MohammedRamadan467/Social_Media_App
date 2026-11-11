import {z} from "zod";
import { LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utlis/validation.js";



export const createComment = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        content: generalValidationFields.content(lang),
    }),
    params:z.strictObject({
        postId: generalValidationFields.id(lang),
    }),
    file: generalValidationFields.file(lang).optional()


}).refine((data) => {
    if (!data.body.content && !data.file) return false;
    return true;
  }
, {
    message: "Post must contain content or attachments",
    path: ["body", "content"]
})
}  


export const GetCommentsById = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        postId: generalValidationFields.id(lang),
    })
})
}  


export const GetCommentById = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        commentId: generalValidationFields.id(lang),
    })
})
}  

export const UpdateComment = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        commentId: generalValidationFields.id(lang),
    }),
     body:z.strictObject({
        content: generalValidationFields.content(lang),
    }),
    file: generalValidationFields.file(lang).optional()

})
}  

