"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proccessMulterUpload = exports.proccessFields = exports.proccessFiles = exports.proccessFile = exports.localFielupload = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const node_crypto_1 = require("node:crypto");
const node_path_1 = require("node:path");
const promises_1 = require("node:fs/promises");
const file_type_1 = require("file-type");
const exception_1 = require("../../exception");
const enum_1 = require("../../enum");
const node_os_1 = require("node:os");
exports.fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    file: ['application/pdf', 'application/json']
};
const localFielupload = ({ maxFileSize = 5, storageApproach = enum_1.StorageApproachEnum.MEMORY }) => {
    const storage = storageApproach == enum_1.StorageApproachEnum.MEMORY ? multer_1.default.memoryStorage() : multer_1.default.diskStorage({
        destination(req, file, callback) {
            callback(null, (0, node_os_1.tmpdir)());
        },
        filename(req, file, callback) {
            callback(null, (0, node_crypto_1.randomUUID)() + file.originalname);
        },
    });
    return (0, multer_1.default)({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};
exports.localFielupload = localFielupload;
const proccessFile = async ({ customPath = "general", file, validation }) => {
    if (file.path) {
        file.buffer = await (0, promises_1.readFile)(file.path);
    }
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        await (0, promises_1.unlink)(file.path);
        throw new exception_1.BadRequestException("Invalid file formats");
    }
    else {
        await (0, promises_1.mkdir)((0, node_path_1.resolve)(`./assets/${customPath}`), { recursive: true });
        const uniqueFilepath = `assets/${customPath}/${(0, node_crypto_1.randomUUID)()}.${result.ext}`;
        await (0, promises_1.writeFile)((0, node_path_1.resolve)(`./${uniqueFilepath}`), file.buffer);
        if (file.path) {
            await (0, promises_1.unlink)(file.path);
        }
        file.path = uniqueFilepath;
        return file;
    }
};
exports.proccessFile = proccessFile;
const proccessFiles = async ({ customPath = "general", files, validation }) => {
    const assets = [];
    try {
        for (const file of files) {
            const uploadFile = await (0, exports.proccessFile)({ customPath, file, validation });
            assets.push(uploadFile);
        }
        return assets;
    }
    catch (error) {
        for (const file of files) {
            if (file.path) {
                await (0, promises_1.unlink)((0, node_path_1.resolve)(`./${file.path}`));
            }
        }
        throw error;
    }
};
exports.proccessFiles = proccessFiles;
const proccessFields = async ({ customPath = "general", fields, validation }) => {
    const assets = [];
    try {
        for (const field of Object.keys(fields)) {
            const files = await (0, exports.proccessFiles)({ customPath, files: fields[field], validation });
            assets.push({ field, files });
        }
        return assets;
    }
    catch (error) {
        for (const { files } of assets) {
            for (const file of files) {
                if (file.path) {
                    await (0, promises_1.unlink)((0, node_path_1.resolve)(`./${file.path}`));
                }
            }
        }
        throw error;
    }
};
exports.proccessFields = proccessFields;
const proccessMulterUpload = async ({ req, customPath = "general", isRequired = true, validation = [] }) => {
    if (req.file) {
        await (0, exports.proccessFile)({ customPath, file: req.file, validation });
    }
    else if (Array.isArray(req.files)) {
        await (0, exports.proccessFiles)({ customPath, files: req.files, validation });
    }
    else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
        await (0, exports.proccessFields)({ customPath, fields: req.files, validation });
    }
};
exports.proccessMulterUpload = proccessMulterUpload;
