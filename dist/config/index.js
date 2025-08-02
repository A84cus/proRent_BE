"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_SECRET = exports.CLOUDINARY_CLOUD_NAME = exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.BASE_FE_URL = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.BASE_FE_URL = _a.BASE_FE_URL, exports.CLOUDINARY_API_KEY = _a.CLOUDINARY_API_KEY, exports.CLOUDINARY_API_SECRET = _a.CLOUDINARY_API_SECRET, exports.CLOUDINARY_CLOUD_NAME = _a.CLOUDINARY_CLOUD_NAME;
exports.JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
