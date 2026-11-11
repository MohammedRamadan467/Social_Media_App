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
    },
    status: {
        type: Number,
        enum: enum_1.AccountStatusEnum,
        default: enum_1.AccountStatusEnum.ACTIVE
    },
    changeStatusAt: Date
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
userSchema.pre('validate', function () {
    console.log("Pre_VALIDATE");
    if (this.provider == enum_1.ProviderEnum.GOOGLE && this.password) {
        throw new Error("Google account cannot hold password");
    }
});
userSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getFilter();
    if (query.paranoid != false)
        this.setQuery({ ...query, status: { $ne: enum_1.AccountStatusEnum.ARCHIVE } });
});
userSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
    const query = this.getFilter();
    const update = this.getUpdate();
    if (update.status == enum_1.AccountStatusEnum.ACTIVE) {
        this.setQuery({ ...query, status: { $eq: enum_1.AccountStatusEnum.ARCHIVE } });
    }
    else if (update.status == enum_1.AccountStatusEnum.ARCHIVE) {
        this.setQuery({ ...query, status: { $ne: enum_1.AccountStatusEnum.ARCHIVE } });
    }
    if (!update.status && query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: enum_1.AccountStatusEnum.ARCHIVE } });
    }
    this.setUpdate({
        ...this.getUpdate(),
        ...(update.status ? { changeStatusAt: new Date() } : {})
    });
});
userSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
    const query = this.getFilter();
    if (!query.force) {
        this.setQuery({ ...query, status: { $eq: enum_1.AccountStatusEnum.ARCHIVE } });
    }
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
