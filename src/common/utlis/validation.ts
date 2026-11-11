import { z } from "zod"
import mongoose from "mongoose"
import { GenderEnum, LanguageEnum } from "../enum"
import { IValidation } from "../interface/validation.interface"


const validationMessages = {

    101: {
        ar: "البريد الإلكتروني غير صحيح",
        en: "Invalid email format"
    },

    102: {
        ar: "اسم المستخدم يجب أن يكون حرفين على الأقل",
        en: "Username must be at least 2 characters"
    },

    103: {
        ar: "اسم المستخدم يجب ألا يتجاوز 51 حرفًا",
        en: "Username must not exceed 51 characters"
    },

    104: {
        ar: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
        en: "Password must be at least 8 characters"
    },

    105: {
        ar: "كلمة المرور يجب ألا تتجاوز 16 حرفًا",
        en: "Password must not exceed 16 characters"
    },

    106: {
        ar: "رقم الهاتف غير صحيح",
        en: "Invalid phone number"
    },

    107: {
        ar: "النوع غير صحيح",
        en: "Invalid gender"
    },

    108: {
        ar: "اسم المستخدم يجب أن يتكون من جزئين",
        en: "Username must contain 2 parts"
    },

    109: {
        ar: "البيانات غير متطابقة",
        en: "Fields do not match"
    },

    110: {
        ar: "اي دي الإلكتروني غير صحيح",
        en: "Invalid id format"
    },

    111: {
        ar: "محتوى البوست يجب ألا يقل عن حرف واحد",
        en: "Post content must contain at least 1 character"
    },

    112: {
       ar: "محتوى البوست يجب ألا يتجاوز 50000 حرف",
       en: "Post content must not exceed 50000 characters"
    }







}


const getValidationMessages = (lang: LanguageEnum | undefined, code: keyof typeof validationMessages) => {
    return lang == LanguageEnum.AR ? validationMessages[code].ar : validationMessages[code].en
}



export const matchFields = ({
    original,
    copy,
    data,
    ctx,
    lang
}: IValidation) => {

    if (data[original] !== data[copy]) {

        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: getValidationMessages(lang, 109)
        })

    }

}


export const generalValidationFields = {

    matchFields,

    email: (lang: LanguageEnum) =>
        z.email({
            message: getValidationMessages(lang, 101)
        }),

    otp: (lang: LanguageEnum) => z.string().regex(/^\d{6}$/, { error: "Invalid code" }),

    password: (lang: LanguageEnum) =>
        z.string().regex(/^(?=.*[a-z])(?=.*\s{0,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#%$_&*()]).{8,16}$/)
            .min(8, {
                message: getValidationMessages(lang, 104)
            })
            .max(16, {
                message: getValidationMessages(lang, 105)
            }),

    content: (lang: LanguageEnum) =>
        z.string()
            .min(1, {
                message: getValidationMessages(lang, 111)
            })
            .max(50000, {
                message: getValidationMessages(lang, 112)
            }).
            optional(),


    file: (lang: LanguageEnum)=> z.strictObject({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            buffer: z.instanceof(Buffer),
            size: z.number(),
            path: z.string(),
        }),

    username: (lang: LanguageEnum) =>
        z.string()
            .min(2, {
                message: getValidationMessages(lang, 102)
            })
            .max(51, {
                message: getValidationMessages(lang, 103)
            }),


    phone: (lang: LanguageEnum) =>
        z.e164({
            message: getValidationMessages(lang, 106)
        }),



    isPrivate: (lang: LanguageEnum) =>
        z.boolean({
            message: "invalid format"
        }),


    confirmPassword: (lang: LanguageEnum) =>
        z.string()
            .min(8, {
                message: getValidationMessages(lang, 104)
            })
            .max(16, {
                message: getValidationMessages(lang, 105)
            }),


    gender: (lang: LanguageEnum) =>
        z.enum(GenderEnum, {
            message: getValidationMessages(lang, 107)
        }),

    id: (lang: LanguageEnum) => z.string().refine((data) => { return mongoose.Types.ObjectId.isValid(data) }, { message: getValidationMessages(lang, 110) }),


}
