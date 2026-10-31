"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.bearerAuth = void 0;
const security_enum_1 = require("../common/enum/security.enum");
const security_1 = require("../common/security");
const domain_exception_js_1 = require("../common/exception/domain.exception.js");
const bearerAuth = async ({ req, tokenType = security_enum_1.tokenTypeEnum.ACCESS }) => {
    const [key, credential] = req.headers['authorization']?.split(" ") ?? [];
    const { user, payload } = await (0, security_1.decodeToken)({ authorization: credential, tokenType });
    req.user = user;
    req.payload = payload;
};
exports.bearerAuth = bearerAuth;
const authentication = (tokenType = security_enum_1.tokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization)
            throw new domain_exception_js_1.UnauthorizedException("Unauthorized Account");
        const [key, credential] = authorization.split(" ");
        switch (key) {
            case "Basic":
                const [email = "", password = ""] = Buffer.from(credential, "base64").toString().split(":");
                req.user = await (0, security_1.basicAuth)({ email, password });
                break;
            case "Bearer":
                await (0, exports.bearerAuth)({ req, tokenType });
                break;
            default:
                next(new Error("Invalid authentication schema", { cause: { status: 400 } }));
                break;
        }
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole)
            throw new domain_exception_js_1.ForbiddenException("Forbidden Account");
        next();
    };
};
exports.authorization = authorization;
