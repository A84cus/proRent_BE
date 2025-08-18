"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../utils/system/logger"));
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    // Log request
    logger_1.default.http(`${req.method} ${req.path} - ${req.ip}`);
    // Log response when it finishes
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger_1.default.http(`${res.statusCode} ${req.method} ${req.path} - ${duration}ms`);
    });
    next();
};
exports.default = loggerMiddleware;
