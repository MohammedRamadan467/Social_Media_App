"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyEnum = exports.ReactionEnum = void 0;
var ReactionEnum;
(function (ReactionEnum) {
    ReactionEnum[ReactionEnum["LIKE"] = 0] = "LIKE";
    ReactionEnum[ReactionEnum["LOVE"] = 1] = "LOVE";
    ReactionEnum[ReactionEnum["HAPPY"] = 2] = "HAPPY";
    ReactionEnum[ReactionEnum["SAD"] = 3] = "SAD";
})(ReactionEnum || (exports.ReactionEnum = ReactionEnum = {}));
var PrivacyEnum;
(function (PrivacyEnum) {
    PrivacyEnum[PrivacyEnum["PUBLIC"] = 0] = "PUBLIC";
    PrivacyEnum[PrivacyEnum["FRIENDS"] = 1] = "FRIENDS";
    PrivacyEnum[PrivacyEnum["ONLY_MY"] = 2] = "ONLY_MY";
})(PrivacyEnum || (exports.PrivacyEnum = PrivacyEnum = {}));
