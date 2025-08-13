"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.SMTP_FROM = exports.SMTP_PASS = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.XENDIT_CALLBACK_BASE_URL = exports.XENDIT_WEBHOOK_TOKEN = exports.XENDIT_SECRET_KEY = exports.NODE_ENV = exports.CLOUDINARY_CLOUD_NAME = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.BASE_FE_URL = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.BASE_FE_URL = _a.BASE_FE_URL, exports.CLOUDINARY_API_KEY = _a.CLOUDINARY_API_KEY, exports.CLOUDINARY_API_SECRET = _a.CLOUDINARY_API_SECRET, exports.CLOUDINARY_CLOUD_NAME = _a.CLOUDINARY_CLOUD_NAME, exports.NODE_ENV = _a.NODE_ENV, exports.XENDIT_SECRET_KEY = _a.XENDIT_SECRET_KEY, exports.XENDIT_WEBHOOK_TOKEN = _a.XENDIT_WEBHOOK_TOKEN, exports.XENDIT_CALLBACK_BASE_URL = _a.XENDIT_CALLBACK_BASE_URL, exports.SMTP_HOST = _a.SMTP_HOST, exports.SMTP_PORT = _a.SMTP_PORT, exports.SMTP_USER = _a.SMTP_USER, exports.SMTP_PASS = _a.SMTP_PASS, exports.SMTP_FROM = _a.SMTP_FROM;
exports.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
