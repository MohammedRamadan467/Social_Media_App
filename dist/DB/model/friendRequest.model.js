"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const friendRequest_enum_1 = require("../../common/enum/friendRequest.enum");
const friendRequestSchema = new mongoose_1.default.Schema({
    senderId: { type: mongoose_1.default.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose_1.default.Types.ObjectId, ref: "User", required: true },
    note: { type: String, minLength: 5, maxLength: 5000 },
    status: { type: Number, enum: friendRequest_enum_1.FriendRequestEnum, default: friendRequest_enum_1.FriendRequestEnum.PENDING }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    autoIndex: true,
    strict: true,
    strictQuery: true
});
exports.FriendRequestModel = mongoose_1.default.models.FriendRequest || mongoose_1.default.model("FriendRequest", friendRequestSchema);
