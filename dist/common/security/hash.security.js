"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.hash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hash = async (plainText, rounds = 12, minor = "b") => {
    const salt = (await bcrypt_1.default.genSalt(rounds, minor)).toString();
    return await bcrypt_1.default.hash(plainText, salt);
};
exports.hash = hash;
const compare = async (plainText, cipherText) => {
    return await bcrypt_1.default.compare(plainText, cipherText);
};
exports.compare = compare;
