"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.USE_GMAIL = exports.GMAIL_PASS = exports.GMAIL_USER = exports.LOGO_URL = exports.SMTP_FROM = exports.SMTP_PASS = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.XENDIT_CALLBACK_BASE_URL = exports.XENDIT_WEBHOOK_TOKEN = exports.XENDIT_SECRET_KEY = exports.NODE_ENV = exports.CLOUDINARY_CLOUD_NAME = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.BASE_FE_URL = exports.PORT = exports.THIRD_PARTY_CONFIG = exports.APP_CONFIG = void 0;
// Environment Variables Configuration
require("dotenv/config");
// App Configuration
exports.APP_CONFIG = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key'
};
// Third-party Service Configuration
exports.THIRD_PARTY_CONFIG = {
    // Cloudinary
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    // Xendit
    XENDIT_SECRET_KEY: process.env.XENDIT_SECRET_KEY,
    XENDIT_WEBHOOK_TOKEN: process.env.XENDIT_WEBHOOK_TOKEN,
    XENDIT_CALLBACK_BASE_URL: process.env.XENDIT_CALLBACK_BASE_URL,
    // Email
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    LOGO_URL: process.env.LOGO_URL,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    USE_GMAIL: process.env.USE_GMAIL,
    USE_DISPOSABLE: process.env.USE_DISPOSABLE,
    BASE_FE_URL: process.env.BASE_FE_URL,
    CRON_API_KEY: process.env.CRON_API_KEY
};
// CronJob
// Legacy exports for backward compatibility
_a = process.env, exports.PORT = _a.PORT, exports.BASE_FE_URL = _a.BASE_FE_URL, exports.CLOUDINARY_API_KEY = _a.CLOUDINARY_API_KEY, exports.CLOUDINARY_API_SECRET = _a.CLOUDINARY_API_SECRET, exports.CLOUDINARY_CLOUD_NAME = _a.CLOUDINARY_CLOUD_NAME, exports.NODE_ENV = _a.NODE_ENV, exports.XENDIT_SECRET_KEY = _a.XENDIT_SECRET_KEY, exports.XENDIT_WEBHOOK_TOKEN = _a.XENDIT_WEBHOOK_TOKEN, exports.XENDIT_CALLBACK_BASE_URL = _a.XENDIT_CALLBACK_BASE_URL, exports.SMTP_HOST = _a.SMTP_HOST, exports.SMTP_PORT = _a.SMTP_PORT, exports.SMTP_USER = _a.SMTP_USER, exports.SMTP_PASS = _a.SMTP_PASS, exports.SMTP_FROM = _a.SMTP_FROM, exports.LOGO_URL = _a.LOGO_URL, exports.GMAIL_USER = _a.GMAIL_USER, exports.GMAIL_PASS = _a.GMAIL_PASS, exports.USE_GMAIL = _a.USE_GMAIL;
exports.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
// Re-export domain configurations
__exportStar(require("./app"), exports);
__exportStar(require("./third-party"), exports);
