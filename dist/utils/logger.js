"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// logger.ts
const winston_1 = __importDefault(require("winston"));
require("winston-daily-rotate-file");
const path_1 = __importDefault(require("path"));
// Define custom log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};
// Define custom colors for log levels
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};
winston_1.default.addColors(colors);
// Define log format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Define log format for console
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize({ all: true }), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`));
// Base: Always log to console
const transports = [
    new winston_1.default.transports.Console({
        format: consoleFormat
    })
];
// Only add file transports if NOT in production (i.e., not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const logDir = path_1.default.join(__dirname, '../logs');
    transports.push(
    // File transport for errors
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'error.log'),
        level: 'error',
        format
    }), 
    // Combined log file
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'combined.log'),
        format
    }), 
    // Daily rotate file transport
    new winston_1.default.transports.DailyRotateFile({
        filename: path_1.default.join(logDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format
    }));
}
// Create and export logger
const Logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels,
    transports
});
exports.default = Logger;
