"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePost = exports.GetPostById = exports.updatePost = exports.createPost = void 0;
const zod_1 = require("zod");
const enum_1 = require("../../common/enum");
const validation_js_1 = require("../../common/utlis/validation.js");
const createPost = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            mentions: zod_1.z.array(validation_js_1.generalValidationFields.id(lang)).min(1).max(5).optional(),
            allowShare: zod_1.z.stringbool({ truthy: ['true'], falsy: ['false'] }).default(true),
            content: zod_1.z.string().min(5).max(500000).optional(),
            privacy: zod_1.z.coerce.number().pipe(zod_1.z.union([zod_1.z.literal(enum_1.PrivacyEnum.FRIENDS), zod_1.z.literal(enum_1.PrivacyEnum.PUBLIC), zod_1.z.literal(enum_1.PrivacyEnum.ONLY_MY)])).default(enum_1.PrivacyEnum.PUBLIC)
        }),
        files: zod_1.z.array(validation_js_1.generalValidationFields.file(lang).optional()).max(3).optional()
    }).superRefine((data, ctx) => {
        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ['content'],
                message: 'content is required'
            });
        }
        if (data.body.mentions?.length) {
            data.body.mentions = [...new Set(data.body.mentions)];
        }
    });
};
exports.createPost = createPost;
const updatePost = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang)
        }),
        body: zod_1.z.strictObject({
            removeAttachments: zod_1.z.array(zod_1.z.string()).min(1).optional(),
            removeMentions: zod_1.z.array(validation_js_1.generalValidationFields.id(lang)).min(1).optional(),
            mentions: zod_1.z.array(validation_js_1.generalValidationFields.id(lang)).min(1).max(5).optional(),
            allowShare: zod_1.z.stringbool({ truthy: ['true'], falsy: ['false'] }).optional(),
            content: zod_1.z.string().min(5).max(500000).optional(),
            privacy: zod_1.z.coerce.number().pipe(zod_1.z.union([
                zod_1.z.literal(enum_1.PrivacyEnum.FRIENDS),
                zod_1.z.literal(enum_1.PrivacyEnum.PUBLIC),
                zod_1.z.literal(enum_1.PrivacyEnum.ONLY_MY)
            ])).optional()
        }),
        files: zod_1.z.array(validation_js_1.generalValidationFields.file(lang).optional()).max(3).optional()
    }).superRefine((data, ctx) => {
        if (data.body.mentions?.length) {
            data.body.mentions = [...new Set(data.body.mentions)];
        }
        if (data.body.removeMentions?.length) {
            data.body.removeMentions = [...new Set(data.body.removeMentions)];
        }
        if (data.body.removeAttachments?.length) {
            data.body.removeAttachments = [...new Set(data.body.removeAttachments)];
        }
    });
};
exports.updatePost = updatePost;
const GetPostById = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang),
        })
    });
};
exports.GetPostById = GetPostById;
const UpdatePost = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang),
        }),
        body: zod_1.z.strictObject({
            content: validation_js_1.generalValidationFields.content(lang),
        }),
        files: zod_1.z.array(validation_js_1.generalValidationFields.file(lang)).max(3).optional()
    });
};
exports.UpdatePost = UpdatePost;
