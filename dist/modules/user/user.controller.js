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
const enum_1 = require("../../common/enum");
const middleware_1 = require("../../middleware");
const user_service_1 = __importDefault(require("./user.service"));
const validators = __importStar(require("./user.validation"));
const router = (0, express_1.Router)();
router.get("/", (0, authentication_middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.profile(req.user);
    return { status: 200, data };
}));
router.patch("/", (0, authentication_middleware_1.authentication)(), (0, authentication_middleware_1.authorization)(enum_1.RoleEnum.USER), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    await user_service_1.default.updateProfile(req.body, req.user);
}));
router.post("/rotate-token", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.REFRESH), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.rotateToken(req.payload, req.user, `${req.protocol}://${req.host}`);
    return { status: 200, data };
}));
router.post("/follow/:userId", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.validation)(validators.followUser), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.followUser(req.validate.params, req.user);
    return { status: 200, data };
}));
router.delete("/unfollow/:userId", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.validation)(validators.followUser), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.UnFollowUser(req.validate.params, req.user);
    return { status: 200, data };
}));
router.get("/search", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.validation)(validators.search), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.searchUsers(req.validate.query, req.user);
    return { status: 200, data };
}));
router.get("/suggestions", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.getUserSuggestions(req.user);
    return { status: 200, data };
}));
router.patch("/privacy", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.validation)(validators.updatePrivacySchema), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.updatePrivacySettings(req.body, req.user);
    return { status: 200, data };
}));
router.get("/suggestions", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.getUserSuggestions(req.user);
    return { status: 200, data };
}));
router.post("/logout", (0, authentication_middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.logout(req.payload, req.user, req.body);
    return { status: 200, data };
}));
router.delete("/deleteAccount", (0, authentication_middleware_1.authentication)(enum_1.tokenTypeEnum.ACCESS), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_service_1.default.deleteAccount(req.user);
    return { status: 200, data };
}));
exports.default = router;
