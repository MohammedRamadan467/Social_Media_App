"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../../common/enum");
const reactionSchema = new mongoose_1.default.Schema({
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    reaction: { type: Number, enum: enum_1.ReactionEnum, default: enum_1.ReactionEnum.LIKE }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    autoIndex: true,
    strict: true,
    strictQuery: true
});
const postSchema = new mongoose_1.default.Schema({
    folderId: { type: Number, required: true },
    content: {
        type: String,
        minLength: 2,
        maxLength: 500000,
        required: function () {
            return !this.attachments?.length;
        },
    },
    attachments: [String],
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    mentions: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    sharedBy: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }],
    allowShare: { type: Boolean, default: true },
    reaction: [reactionSchema],
    privacy: { type: Number, enum: enum_1.PrivacyEnum, default: enum_1.PrivacyEnum.PUBLIC }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    autoIndex: true,
    strict: true,
    strictQuery: true
});
exports.PostModel = mongoose_1.default.models.Post || mongoose_1.default.model("Post", postSchema);
