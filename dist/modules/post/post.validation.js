"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePost = exports.GetPostById = exports.createPost = void 0;
const zod_1 = require("zod");
const validation_js_1 = require("../../common/utlis/validation.js");
const createPost = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            content: validation_js_1.generalValidationFields.content(lang),
        }),
        files: zod_1.z.array(validation_js_1.generalValidationFields.file(lang)).max(3).optional()
    }).refine((data) => {
        if (!data.body.content && !data.files?.length)
            return false;
        return true;
    }, {
        message: "Post must contain content or attachments",
        path: ["body", "content"]
    });
};
exports.createPost = createPost;
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
