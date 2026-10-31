"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrivacySchema = exports.search = exports.followUser = void 0;
const zod_1 = require("zod");
const validation_js_1 = require("../../common/utlis/validation.js");
const followUser = (lang) => {
    return zod_1.z.object({
        params: zod_1.z.strictObject({
            userId: validation_js_1.generalValidationFields.id(lang)
        })
    });
};
exports.followUser = followUser;
const search = (lang) => {
    return zod_1.z.object({
        query: zod_1.z.strictObject({
            keyword: validation_js_1.generalValidationFields.username(lang)
        }),
    });
};
exports.search = search;
const updatePrivacySchema = (lang) => {
    return zod_1.z.object({
        body: zod_1.z.strictObject({
            isPrivate: validation_js_1.generalValidationFields.isPrivate(lang)
        }),
    });
};
exports.updatePrivacySchema = updatePrivacySchema;
