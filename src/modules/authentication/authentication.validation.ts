import {z} from "zod";
import { LanguageEnum } from "../../common/enum";
import { generalValidationFields } from "../../common/utlis/validation.js";

export const loginSchema = (lang:LanguageEnum)=>{
    return z.strictObject({
    email:generalValidationFields.email(lang),
    password:generalValidationFields.password(lang)
})
}



export const login = (lang:LanguageEnum)=>{
     return z.object({
    body:loginSchema(lang),
})
}




export const signup = (lang:LanguageEnum)=>{

    return  z.object({
    body: loginSchema(lang).safeExtend({
    username:generalValidationFields.username(lang),
    phone:generalValidationFields.phone(lang),
    confirmPassword:generalValidationFields.password(lang),
}).superRefine((data , ctx)=>{

generalValidationFields.matchFields({original:"password" , copy :"confirmPassword" , data , ctx , lang})

if (!data.username.includes(" ")) {
    ctx.addIssue({
        code:"custom",
        path:['username'],
        message :"username must contain 2 parts"
    })
}
})
})
}

export const confirmEmail = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang),
        otp:generalValidationFields.otp(lang)
    }),
})
}

export const resendConfirmEmail = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang)
    }),
})
}

export const requestForgotPasswordCode = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang)
    }),
})
}


export const enable_2_step_verification = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang)
    }),
})
}

export const confirm_2_step_verification = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang),
        otp:generalValidationFields.otp(lang)
    }),
})
}


export const Confirmation_Login = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang),
        otp:generalValidationFields.otp(lang)
    }),
})
}


export const veriryForgotPassword = (lang:LanguageEnum)=>{
     return z.object({
    body:z.strictObject({
        email:generalValidationFields.email(lang),
        otp:generalValidationFields.otp(lang),
        password:generalValidationFields.password(lang),
        confirmPassword:generalValidationFields.password(lang),
}).superRefine((data , ctx)=>{

generalValidationFields.matchFields({original:"password" , copy :"confirmPassword" , data , ctx , lang})

})})
}


