"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exception_1 = require("../../common/exception");
const repository_1 = require("../../common/repository");
const service_1 = require("../../common/service");
const config_1 = require("../../config");
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../../common/enum");
const security_1 = require("../../common/security");
const utlis_1 = require("../../common/utlis");
class UserService {
    userRepository;
    cacheService;
    followRepository;
    tokenService;
    cloudService;
    constructor() {
        this.cacheService = service_1.cacheService;
        this.userRepository = repository_1.userRepository;
        this.followRepository = repository_1.followRepository;
        this.tokenService = security_1.tokenService;
        this.cloudService = service_1.cloudService;
    }
    async profileImage(file, user) {
        const key = await this.cloudService.uploadAsset({
            file,
            folder: `User/${user._id.toString()}`
        });
        return key;
    }
    async profile(user) {
        user.phone = await (0, security_1.decryption)(user.phone);
        return { user };
    }
    async updateProfile(data, user) {
        if (data.phone) {
            data.phone = await (0, security_1.encryption)(data.phone);
        }
        const updatedUser = await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: { $set: data }
        });
        return updatedUser;
    }
    async rotateToken(payload, user, issuer) {
        const accessExpiresIn = (payload.iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (5 * 6000);
        if (currentTime < accessExpiresIn) {
            throw new exception_1.ConflictException("sorry we cannot create new login credintials while current access token still within valid time range");
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer });
        await this.tokenService.createRevokeToken({ payload });
        return data;
    }
    async createRevokeToken({ payload }) {
        const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat);
        const refreshExpiredIn = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
        const ttl = refreshExpiredIn - consumedTime;
        await this.cacheService.set({ key: this.tokenService.userRevokeTokenKey({ userId: new mongoose_1.default.Types.ObjectId(payload.sub), jti: payload.jti }), value: payload.jti, ttl });
        return;
    }
    async logout(payload, user, { action = enum_1.LogoutEnum.DEVICE }) {
        switch (action) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime;
                await user.save();
                await this.cacheService.del({ key: await this.cacheService.keys({ prefix: this.tokenService.userBaseRevokeTokenKey({ userId: (0, utlis_1.toObjectId)(payload.sub) }) }) });
                break;
            default:
                await this.tokenService.createRevokeToken({
                    payload: payload
                });
                break;
        }
        return;
    }
    async followUser({ userId }, user) {
        const targetUser = await this.userRepository.findById({
            id: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (!targetUser) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user._id.toString() === userId) {
            throw new exception_1.BadRequestException("You cannot follow yourself");
        }
        const existFollow = await this.followRepository.findOne({
            filter: {
                follower: user._id,
                following: targetUser._id
            }
        });
        if (existFollow) {
            throw new exception_1.ConflictException("You are already following this user");
        }
        const follow = await this.followRepository.create({
            data: {
                follower: user._id,
                following: targetUser._id
            }
        });
        return follow;
    }
    async UnFollowUser({ userId }, user) {
        const targetUser = await this.userRepository.findById({
            id: new mongoose_1.default.Types.ObjectId(userId)
        });
        if (!targetUser) {
            throw new exception_1.NotFoundException("User not found");
        }
        if (user._id.toString() === userId) {
            throw new exception_1.BadRequestException("You cannot Unfollow yourself");
        }
        const existFollow = await this.followRepository.findOne({
            filter: {
                follower: user._id,
                following: targetUser._id
            }
        });
        if (!existFollow) {
            throw new exception_1.NotFoundException("Follow not found");
        }
        await this.followRepository.deleteOne({
            filter: {
                follower: user._id,
                following: targetUser._id
            }
        });
    }
    async searchUsers({ keyword }, user) {
        if (!keyword?.trim()) {
            throw new exception_1.BadRequestException("Search keyword is required");
        }
        const users = await this.userRepository.find({
            filter: {
                _id: { $ne: user._id },
                $or: [
                    { firstName: { $regex: keyword.trim(), $options: "i" } },
                    { lastName: { $regex: keyword.trim(), $options: "i" } },
                    { username: { $regex: keyword.trim(), $options: "i" } }
                ]
            }
        });
        return users;
    }
    async getUserSuggestions(user) {
        const followingUsers = await this.followRepository.find({
            filter: {
                follower: user._id
            }
        });
        const followingIds = followingUsers.map(follow => follow.following);
        if (!followingIds.length) {
            return [];
        }
        const suggestions = await this.followRepository.find({
            filter: {
                follower: { $in: followingIds },
                following: {
                    $nin: [user._id, ...followingIds]
                }
            }
        });
        const users = await this.userRepository.find({
            filter: {
                _id: {
                    $in: suggestions.map(follow => follow.following)
                }
            }
        });
        return users;
    }
    async updatePrivacySettings({ isPrivate }, user) {
        await this.userRepository.updateOne({
            filter: { _id: user._id },
            update: {
                $set: { isPrivate }
            }
        });
        return { message: "Privacy settings updated successfully" };
    }
    async deleteAccount(user) {
        await this.followRepository.deleteMany({
            filter: {
                $or: [
                    { follower: user._id },
                    { following: user._id }
                ]
            }
        });
        await this.userRepository.deleteOne({
            filter: { _id: user._id }
        });
        return { message: "Account deleted successfully" };
    }
}
exports.default = new UserService();
