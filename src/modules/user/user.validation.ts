import {z} from "zod";
import { LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utlis/validation.js";



export const followUser = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        userId: generalValidationFields.id(lang) 
    })

})
}  


export const search = (lang:LanguageEnum)=>{
     return z.object({
    query:z.strictObject({
        keyword:generalValidationFields.username(lang)
    }),
})
}



export const updatePrivacySchema = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        isPrivate:generalValidationFields.isPrivate(lang)
    }),
})
}
