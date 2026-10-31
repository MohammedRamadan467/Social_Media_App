"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandling = void 0;
const globalErrorHandling = (error, req, res, next) => {
    if (error.name?.toLowerCase()?.includes("sequelize")) {
        error.cause ??= { status: 400 };
    }
    return res.status(error.status ?? 500).json({
        error_message: error.message || 'server error',
        cause: error.cause,
        error: error,
        stack: error.stack
    });
};
exports.globalErrorHandling = globalErrorHandling;
