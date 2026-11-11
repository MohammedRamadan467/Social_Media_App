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
const middleware_1 = require("../../middleware");
const multer_1 = require("../../common/utlis/multer");
const enum_1 = require("../../common/enum");
const validators = __importStar(require("./comment.validation"));
const comment_service_1 = __importDefault(require("./comment.service"));
const router = (0, express_1.Router)();
router.post("/:postId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFielupload)({
        storageApproach: enum_1.StorageApproachEnum.MEMORY
    }).single("attachment"),
    customPath: "Post",
    validation: multer_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(validators.createComment), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.createComment({
        ...req.validate.body, attachments: req.file ? [req.file.path] : []
    }, req.validate.params.postId, req.user);
    return { status: 201, data };
}));
router.get("/:postId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.validation)(validators.GetCommentsById), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.getAllComments(req.validate.params.postId, req.user);
    return { status: 200, data };
}));
router.get("/getCommentById/:commentId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.validation)(validators.GetCommentById), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.getComment(req.validate.params.commentId, req.user);
    return { status: 200, data };
}));
router.patch("/:commentId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.uploadMiddleware)({
    multerMiddleware: (0, multer_1.localFielupload)({
        storageApproach: enum_1.StorageApproachEnum.MEMORY
    }).single("attachment"),
    customPath: "Post",
    validation: multer_1.fileValidation.image,
    isRequired: false
}), (0, middleware_1.validation)(validators.UpdateComment), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.updateComment(req.validate.params.commentId, {
        ...req.validate.body, attachments: req.file ? [req.file.path] : []
    }, req.user);
    return { status: 200, data };
}));
router.delete("/:commentId", (0, authentication_middleware_1.authentication)(), (0, middleware_1.validation)(validators.GetCommentById), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await comment_service_1.default.deleteComment(req.validate.params.commentId, req.user);
    return { status: 200, data };
}));
exports.default = router;
