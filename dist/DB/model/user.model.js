"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../../common/enum");
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    lastName: {
        type: String,
        minLength: 2,
        maxLength: 25,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider == enum_1.ProviderEnum.SYSTEM;
        }
    },
    phone: String,
    DOB: Date,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    gender: {
        type: Number,
        enum: enum_1.GenderEnum,
        default: enum_1.GenderEnum.MALE
    },
    role: {
        type: Number,
        enum: enum_1.RoleEnum,
        default: enum_1.RoleEnum.USER
    },
    provider: {
        type: Number,
        enum: enum_1.ProviderEnum,
        default: enum_1.ProviderEnum.SYSTEM
    },
    changeCredentialsTime: Date,
    twoStepVerification: Date,
    isPrivate: {
        type: Boolean,
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
userSchema.virtual("username").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
