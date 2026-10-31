"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.veriryForgotPassword = exports.Confirmation_Login = exports.confirm_2_step_verification = exports.enable_2_step_verification = exports.requestForgotPasswordCode = exports.resendConfirmEmail = exports.confirmEmail = exports.signup = exports.login = exports.loginSchema = void 0;
const zod_1 = require("zod");
const validation_js_1 = require("../../common/utlis/validation.js");
const loginSchema = (lang) => {
    return zod_1.z.strictObject({
        email: validation_js_1.generalValidationFields.email(lang),
        password: validation_js_1.generalValidationFields.password(lang)
    });
};
exports.loginSchema = loginSchema;
const login = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang),
    });
};
exports.login = login;
const signup = (lang) => {
    return zod_1.z.object({
        body: (0, exports.loginSchema)(lang).safeExtend({
            username: validation_js_1.generalValidationFields.username(lang),
            phone: validation_js_1.generalValidationFields.phone(lang),
            confirmPassword: validation_js_1.generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {
            validation_js_1.generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang });
            if (!data.username.includes(" ")) {
                ctx.addIssue({
                    code: "custom",
                    path: ['username'],
                    message: "username must contain 2 parts"
                });
            }
        })
    });
};
exports.signup = signup;
const confirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang),
            otp: validation_js_1.generalValidationFields.otp(lang)
        }),
    });
};
exports.confirmEmail = confirmEmail;
const resendConfirmEmail = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang)
        }),
    });
};
exports.resendConfirmEmail = resendConfirmEmail;
const requestForgotPasswordCode = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang)
        }),
    });
};
exports.requestForgotPasswordCode = requestForgotPasswordCode;
const enable_2_step_verification = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang)
        }),
    });
};
exports.enable_2_step_verification = enable_2_step_verification;
const confirm_2_step_verification = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang),
            otp: validation_js_1.generalValidationFields.otp(lang)
        }),
    });
};
exports.confirm_2_step_verification = confirm_2_step_verification;
const Confirmation_Login = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang),
            otp: validation_js_1.generalValidationFields.otp(lang)
        }),
    });
};
exports.Confirmation_Login = Confirmation_Login;
const veriryForgotPassword = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            email: validation_js_1.generalValidationFields.email(lang),
            otp: validation_js_1.generalValidationFields.otp(lang),
            password: validation_js_1.generalValidationFields.password(lang),
            confirmPassword: validation_js_1.generalValidationFields.password(lang),
        }).superRefine((data, ctx) => {
            validation_js_1.generalValidationFields.matchFields({ original: "password", copy: "confirmPassword", data, ctx, lang });
        })
    });
};
exports.veriryForgotPassword = veriryForgotPassword;
