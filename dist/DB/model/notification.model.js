"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const notificationSchema = new mongoose_1.default.Schema({
    recipient_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    target_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    type: {
        type: String,
        required: true
    },
    is_read: {
        type: zod_1.boolean,
        default: false
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    autoIndex: true,
    strict: true,
    strictQuery: true
});
exports.NotificationModel = mongoose_1.default.models.Notification || mongoose_1.default.model("Notification", notificationSchema);
