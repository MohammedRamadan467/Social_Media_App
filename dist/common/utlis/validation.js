"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = exports.matchFields = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../enum");
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
    }
};
const getValidationMessages = (lang, code) => {
    return lang == enum_1.LanguageEnum.AR ? validationMessages[code].ar : validationMessages[code].en;
};
const matchFields = ({ original, copy, data, ctx, lang }) => {
    if (data[original] !== data[copy]) {
        ctx.addIssue({
            code: "custom",
            path: [copy],
            message: getValidationMessages(lang, 109)
        });
    }
};
exports.matchFields = matchFields;
exports.generalValidationFields = {
    matchFields: exports.matchFields,
    email: (lang) => zod_1.z.email({
        message: getValidationMessages(lang, 101)
    }),
    otp: (lang) => zod_1.z.string().regex(/^\d{6}$/, { error: "Invalid code" }),
    password: (lang) => zod_1.z.string().regex(/^(?=.*[a-z])(?=.*\s{0,})(?=.*[A-Z])(?=.*\d)(?=.*[!@#%$_&*()]).{8,16}$/)
        .min(8, {
        message: getValidationMessages(lang, 104)
    })
        .max(16, {
        message: getValidationMessages(lang, 105)
    }),
    username: (lang) => zod_1.z.string()
        .min(2, {
        message: getValidationMessages(lang, 102)
    })
        .max(51, {
        message: getValidationMessages(lang, 103)
    }),
    phone: (lang) => zod_1.z.e164({
        message: getValidationMessages(lang, 106)
    }),
    isPrivate: (lang) => zod_1.z.boolean({
        message: "invalid format"
    }),
    confirmPassword: (lang) => zod_1.z.string()
        .min(8, {
        message: getValidationMessages(lang, 104)
    })
        .max(16, {
        message: getValidationMessages(lang, 105)
    }),
    gender: (lang) => zod_1.z.enum(enum_1.GenderEnum, {
        message: getValidationMessages(lang, 107)
    }),
    id: (lang) => zod_1.z.string().refine((data) => { return mongoose_1.default.Types.ObjectId.isValid(data); }, { message: getValidationMessages(lang, 110) }),
    file: (lang) => zod_1.z.strictObject({
        fieldname: zod_1.z.string(),
        originalname: zod_1.z.string(),
        encoding: zod_1.z.string(),
        mimetype: zod_1.z.string(),
        buffer: zod_1.z.instanceof(Buffer),
        size: zod_1.z.number(),
        path: zod_1.z.string(),
    }),
};
