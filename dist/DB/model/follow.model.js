"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const followSchema = new mongoose_1.default.Schema({
    follower: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    following: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    autoIndex: true,
    strict: true,
    strictQuery: true
});
exports.FollowModel = mongoose_1.default.models.Follow || mongoose_1.default.model("Follow", followSchema);
