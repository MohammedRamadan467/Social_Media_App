import {z} from "zod";
import { LanguageEnum, PrivacyEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utlis/validation.js";



export const createPost = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        mentions:z.array(generalValidationFields.id(lang)).min(1).max(5).optional(),
        allowShare:z.stringbool({truthy:['true'] , falsy:['false']}).default(true),
        content:z.string().min(5).max(500000).optional(),
        privacy:z.coerce.number().pipe(z.union([z.literal(PrivacyEnum.FRIENDS) , z.literal(PrivacyEnum.PUBLIC) ,z.literal(PrivacyEnum.ONLY_MY)])).default(PrivacyEnum.PUBLIC)

    }),
    files: z.array(generalValidationFields.file(lang).optional()).max(3).optional()


}).superRefine((data , ctx) => {
    if (!data.body.content && !data.files?.length){
        ctx.addIssue({
            code:"custom",
            path:['content'],
            message:'content is required'
        })
    }


    if (data.body.mentions?.length){
        data.body.mentions = [...new Set(data.body.mentions)]
    }
  }

)
}  


export const updatePost = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        postId:generalValidationFields.id(lang)
    }),
    body:z.strictObject({
        removeAttachments:z.array(z.string()).min(1).optional(),
        removeMentions:z.array(generalValidationFields.id(lang)).min(1).optional(),
        mentions:z.array(generalValidationFields.id(lang)).min(1).max(5).optional(),
        allowShare:z.stringbool({truthy:['true'] , falsy:['false']}).optional(),
        content:z.string().min(5).max(500000).optional(),
        privacy:z.coerce.number().pipe(z.union([
            z.literal(PrivacyEnum.FRIENDS) ,
            z.literal(PrivacyEnum.PUBLIC) ,
            z.literal(PrivacyEnum.ONLY_MY)
        ])).optional()

    }),
    files: z.array(generalValidationFields.file(lang).optional()).max(3).optional()


}).superRefine((data , ctx) => {

    if (data.body.mentions?.length){
        data.body.mentions = [...new Set(data.body.mentions)]
    }

    if (data.body.removeMentions?.length){
        data.body.removeMentions = [...new Set(data.body.removeMentions)]
    }


    if (data.body.removeAttachments?.length){
        data.body.removeAttachments = [...new Set(data.body.removeAttachments)]
    }


  }

)
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

