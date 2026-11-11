"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateComment = exports.GetCommentById = exports.GetCommentsById = exports.createComment = void 0;
const zod_1 = require("zod");
const validation_js_1 = require("../../common/utlis/validation.js");
const createComment = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            content: validation_js_1.generalValidationFields.content(lang),
        }),
        params: zod_1.z.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang),
        }),
        file: validation_js_1.generalValidationFields.file(lang).optional()
    }).refine((data) => {
        if (!data.body.content && !data.file)
            return false;
        return true;
    }, {
        message: "Post must contain content or attachments",
        path: ["body", "content"]
    });
};
exports.createComment = createComment;
const GetCommentsById = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            postId: validation_js_1.generalValidationFields.id(lang),
        })
    });
};
exports.GetCommentsById = GetCommentsById;
const GetCommentById = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            commentId: validation_js_1.generalValidationFields.id(lang),
        })
    });
};
exports.GetCommentById = GetCommentById;
const UpdateComment = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            commentId: validation_js_1.generalValidationFields.id(lang),
        }),
        body: zod_1.z.strictObject({
            content: validation_js_1.generalValidationFields.content(lang),
        }),
        file: validation_js_1.generalValidationFields.file(lang).optional()
    });
};
exports.UpdateComment = UpdateComment;
