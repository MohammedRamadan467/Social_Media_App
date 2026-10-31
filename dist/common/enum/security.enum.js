"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutEnum = exports.LanguageEnum = exports.tokenTypeEnum = exports.HashApproachEnum = void 0;
var HashApproachEnum;
(function (HashApproachEnum) {
    HashApproachEnum[HashApproachEnum["BCRYPT"] = 0] = "BCRYPT";
    HashApproachEnum[HashApproachEnum["ARGON2"] = 1] = "ARGON2";
})(HashApproachEnum || (exports.HashApproachEnum = HashApproachEnum = {}));
var tokenTypeEnum;
(function (tokenTypeEnum) {
    tokenTypeEnum[tokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    tokenTypeEnum[tokenTypeEnum["REFRESH"] = 1] = "REFRESH";
})(tokenTypeEnum || (exports.tokenTypeEnum = tokenTypeEnum = {}));
var LanguageEnum;
(function (LanguageEnum) {
    LanguageEnum[LanguageEnum["AR"] = 0] = "AR";
    LanguageEnum[LanguageEnum["EN"] = 1] = "EN";
})(LanguageEnum || (exports.LanguageEnum = LanguageEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum[LogoutEnum["DEVICE"] = 0] = "DEVICE";
    LogoutEnum[LogoutEnum["ALL"] = 1] = "ALL";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
