"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = require("../../middleware/authentication.middleware");
const validators = __importStar(require("./post.validation"));
const middleware_1 = require("../../middleware");
const post_service_1 = __importDefault(require("./post.service"));
const multer_1 = require("../../common/utlis/multer");
const enum_1 = require("../../common/enum");
const router = (0, express_1.Router)();
router.post("/", (0, authentication_middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFielupload)({
        storageApproach: enum_1.StorageApproachEnum.MEMORY
    }).array("attachment", 3),
    customPath: "Post",
    validation: multer_1.fileValidation.image
}), (0, middleware_1.validation)(validators.createPost), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.createPost({
        ...req.validate.body,
        attachments: Array.isArray(req.files)
            ? req.files.map(file => file.path)
            : []
    }, req.user);
    return { status: 201, data };
}));
router.get("/", (0, authentication_middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.getAllPost(req.user);
    return { status: 200, data };
}));
router.get("/:postId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.validation)(validators.GetPostById), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.getPost(req.validate.params.postId, req.user);
    return { status: 200, data };
}));
router.patch("/:postId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFielupload)({
        storageApproach: enum_1.StorageApproachEnum.MEMORY
    }).array("attachment", 3),
    customPath: "Post",
    validation: multer_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(validators.UpdatePost), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.updatePost(req.validate.params.postId, {
        ...req.validate.body,
        attachments: Array.isArray(req.files) ? req.files.map(file => file.path) : []
    }, req.user);
    return { status: 200, data };
}));
router.delete("/:postId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.validation)(validators.GetPostById), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_service_1.default.deletePost(req.validate.params.postId, req.user);
    return { status: 200, data };
}));
exports.default = router;
