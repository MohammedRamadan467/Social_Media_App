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



export const sendFriendRequest = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        receiverId:generalValidationFields.id(lang),
        note:z.string().optional()
    }),
})
}


export const acceptFriendRequest = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        friendRequestId:generalValidationFields.id(lang)
    }),
})
}


export const unFriend = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        friendId:generalValidationFields.id(lang)
    }),
})
}


export const blockFriend = (lang:LanguageEnum)=>{
     return z.object({
    params:z.strictObject({
        friendId:generalValidationFields.id(lang)
    }),
})
}
