"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const domain_exception_js_1 = require("../common/exception/domain.exception.js");
const multer_1 = require("../common/utlis/multer");
const uploadMiddleware = ({ isRequired = true, multerMiddleware, customPath = "general", validation }) => {
    return (req, res, next) => {
        multerMiddleware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
                return;
            }
            try {
                if (isRequired
                    && (!req.file &&
                        !(Array.isArray(req.files) && req.files.length) &&
                        !(typeof req.files == "object" && Object.keys(req.files)?.length))) {
                    next(new domain_exception_js_1.BadRequestException("File is required"));
                    return;
                }
                await (0, multer_1.proccessMulterUpload)({ req, customPath, isRequired, validation });
                next();
            }
            catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
            }
        });
    };
};
exports.uploadMiddleware = uploadMiddleware;
