"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const repository_1 = require("../repository");
const service_1 = require("../service");
const config_1 = require("../../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const enum_1 = require("../enum");
const exception_1 = require("../exception");
const utlis_1 = require("../utlis");
const node_crypto_1 = require("node:crypto");
const hash_security_1 = require("./hash.security");
class TokenService {
    userRepositort;
    cacheService;
    constructor() {
        this.userRepositort = repository_1.userRepository;
        this.cacheService = service_1.cacheService;
    }
    userBaseKey({ userId }) {
        return `User::${userId.toString()}`;
    }
    userBaseRevokeTokenKey({ userId }) {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }
    userRevokeTokenKey({ userId, jti }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    async createToken({ payload, secret_key = config_1.ACCESS_USER_TOKEN_SIGNUTURE, options }) {
        return jsonwebtoken_1.default.sign(payload, secret_key, options);
    }
    async verifyToken({ token = "", secret_key = config_1.ACCESS_USER_TOKEN_SIGNUTURE, }) {
        return jsonwebtoken_1.default.verify(token, secret_key);
    }
    async getTokenSignatures({ role = enum_1.RoleEnum.USER }) {
        let signatures;
        switch (role) {
            case enum_1.RoleEnum.ADMIN:
                signatures = { accessSignature: config_1.ACCESS_ADMIN_TOKEN_SIGNUTURE, refreshSignature: config_1.REFRESH_ADMIN_TOKEN_SIGNUTURE };
                break;
            default:
                signatures = { accessSignature: config_1.ACCESS_USER_TOKEN_SIGNUTURE, refreshSignature: config_1.REFRESH_USER_TOKEN_SIGNUTURE };
                break;
        }
        return signatures;
    }
    async getSignature({ tokenType = enum_1.tokenTypeEnum.ACCESS, role = enum_1.RoleEnum.USER }) {
        const signatures = await this.getTokenSignatures({ role });
        return tokenType == enum_1.tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature;
    }
    async decodeToken({ authorization = "", tokenType = enum_1.tokenTypeEnum.ACCESS }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        console.log(decoded);
        if (!decoded ||
            typeof decoded === "string" ||
            !decoded.aud) {
            throw new exception_1.BadRequestException("missing decoded payload");
        }
        const payload = await this.verifyToken({
            token: authorization,
            secret_key: await this.getSignature({
                tokenType,
                role: decoded.aud[0]
            })
        });
        if (!payload ||
            typeof payload === "string" ||
            !payload.sub ||
            !payload.jti) {
            throw new exception_1.BadRequestException("missing token payload");
        }
        if (await this.cacheService.exist({ key: this.userRevokeTokenKey({ userId: new mongoose_1.default.Types.ObjectId(payload.sub), jti: payload.jti }) })) {
            throw new exception_1.UnauthorizedException("Expired login credentials");
        }
        const user = await this.userRepositort.findById({
            id: (0, utlis_1.toObjectId)(payload.sub)
        });
        if (!user)
            throw new exception_1.NotFoundException("Invalid user");
        if (!payload.iat)
            throw new exception_1.BadRequestException("missing token iat");
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new exception_1.UnauthorizedException("Expired login credentials");
        }
        return { user, payload };
    }
    async createLoginCredentials({ user, issuer, options = {} }) {
        const { accessSignature, refreshSignature } = await this.getTokenSignatures({ role: user.role });
        const jwtid = (0, node_crypto_1.randomUUID)();
        const access_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret_key: accessSignature,
            options: {
                ...options,
                issuer,
                audience: [user.role],
                expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            }
        });
        const refresh_token = await this.createToken({
            payload: { sub: user._id.toString() },
            secret_key: refreshSignature,
            options: {
                ...options,
                issuer,
                audience: [user.role],
                expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            },
        });
        return { access_token, refresh_token };
    }
    async createRevokeToken({ payload }) {
        const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat);
        const refreshExpiredIn = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
        const ttl = refreshExpiredIn - consumedTime;
        await this.cacheService.set({ key: this.userRevokeTokenKey({ userId: new mongoose_1.default.Types.ObjectId(payload.sub), jti: payload.jti }), value: payload.jti, ttl });
        return;
    }
    basicAuth = async ({ email, password }) => {
        const account = await this.userRepositort.findOne({
            filter: { email }
        });
        if (!account)
            throw new exception_1.NotFoundException("not Exist");
        const match = await (0, hash_security_1.compare)(password, account.password);
        if (!match)
            throw new exception_1.NotFoundException("not Exist");
        return account;
    };
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
