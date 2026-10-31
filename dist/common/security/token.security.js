"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuth = exports.createRevokeToken = exports.createLoginCredentials = exports.decodeToken = exports.verifyToken = exports.createToken = exports.userRevokeTokenKey = exports.userBaseRevokeTokenKey = exports.userBaseKey = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = require("node:crypto");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../../config");
const enum_1 = require("../enum");
const domain_exception_js_1 = require("../exception/domain.exception.js");
const hash_security_1 = require("./hash.security");
const service_1 = require("../../common/service");
const repository_1 = require("../repository");
const userBaseKey = ({ userId }) => {
    return `User::${userId.toString()}`;
};
exports.userBaseKey = userBaseKey;
const userBaseRevokeTokenKey = ({ userId }) => {
    return `${(0, exports.userBaseKey)({ userId })}::Revoke_Token`;
};
exports.userBaseRevokeTokenKey = userBaseRevokeTokenKey;
const userRevokeTokenKey = ({ userId, jti }) => {
    return `${(0, exports.userBaseRevokeTokenKey)({ userId })}::${jti}`;
};
exports.userRevokeTokenKey = userRevokeTokenKey;
const createToken = async ({ payload = {}, secret_key = config_1.ACCESS_USER_TOKEN_SIGNUTURE, options = {} } = {}) => {
    return jsonwebtoken_1.default.sign(payload, secret_key, options);
};
exports.createToken = createToken;
const verifyToken = async ({ token = "", secret_key = config_1.ACCESS_USER_TOKEN_SIGNUTURE, } = {}) => {
    return jsonwebtoken_1.default.verify(token, secret_key);
};
exports.verifyToken = verifyToken;
const getTokenSignatures = async ({ role = enum_1.RoleEnum.USER } = {}) => {
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
};
const getSignature = async ({ tokenType = enum_1.tokenTypeEnum.ACCESS, role = enum_1.RoleEnum.USER } = {}) => {
    const signatures = await getTokenSignatures({ role });
    return tokenType == enum_1.tokenTypeEnum.ACCESS ? signatures.accessSignature : signatures.refreshSignature;
};
const decodeToken = async ({ authorization = "", tokenType = enum_1.tokenTypeEnum.ACCESS } = {}) => {
    const decoded = jsonwebtoken_1.default.decode(authorization);
    console.log(decoded);
    if (!decoded ||
        typeof decoded === "string" ||
        !decoded.aud) {
        throw new domain_exception_js_1.BadRequestException("missing decoded payload");
    }
    const payload = await (0, exports.verifyToken)({
        token: authorization,
        secret_key: await getSignature({
            tokenType,
            role: Number(exports.decodeToken)
        })
    });
    if (!payload ||
        typeof payload === "string" ||
        !payload.sub ||
        !payload.jti) {
        throw new domain_exception_js_1.BadRequestException("missing token payload");
    }
    if (await service_1.cacheService.exist({ key: (0, exports.userRevokeTokenKey)({ userId: new mongoose_1.default.Types.ObjectId(payload.sub), jti: payload.jti }) })) {
        throw new domain_exception_js_1.UnauthorizedException("Expired login credentials");
    }
    const user = await repository_1.userRepository.findById({
        id: new mongoose_1.default.Types.ObjectId(payload.sub)
    });
    if (!user)
        throw new domain_exception_js_1.NotFoundException("Invalid user");
    if (!payload.iat)
        throw new domain_exception_js_1.BadRequestException("missing token iat");
    if (new Date(user.changeCredentialsTime ?? 0).getTime() > payload.iat * 1000) {
        throw new domain_exception_js_1.UnauthorizedException("Expired login credentials");
    }
    return { user, payload };
};
exports.decodeToken = decodeToken;
const createLoginCredentials = async ({ user, issuer, options = {} }) => {
    const { accessSignature, refreshSignature } = await getTokenSignatures({ role: user.role });
    const jwtid = (0, node_crypto_1.randomUUID)();
    const access_token = await (0, exports.createToken)({
        payload: { sub: user._id.toString() },
        secret_key: accessSignature,
        options: {
            ...options,
            issuer,
            audience: String(user.role),
            expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        }
    });
    const refresh_token = await (0, exports.createToken)({
        payload: { sub: user._id.toString() },
        secret_key: refreshSignature,
        options: {
            ...options,
            issuer,
            audience: String(user.role),
            expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const createRevokeToken = async ({ payload }) => {
    const consumedTime = (Math.ceil(Date.now() / 1000) - payload.iat);
    const refreshExpiredIn = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
    const ttl = refreshExpiredIn - consumedTime;
    await service_1.cacheService.set({ key: (0, exports.userRevokeTokenKey)({ userId: new mongoose_1.default.Types.ObjectId(payload.sub), jti: payload.jti }), value: payload.jti, ttl });
    return;
};
exports.createRevokeToken = createRevokeToken;
const basicAuth = async ({ email, password }) => {
    const account = await repository_1.userRepository.findOne({
        filter: { email }
    });
    if (!account)
        throw new domain_exception_js_1.NotFoundException("not Exist");
    const match = await (0, hash_security_1.compare)(password, account.password);
    if (!match)
        throw new domain_exception_js_1.NotFoundException("not Exist");
    return account;
};
exports.basicAuth = basicAuth;
