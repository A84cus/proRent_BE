"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const environment_1 = require("../environment");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: environment_1.THIRD_PARTY_CONFIG.CLOUDINARY_CLOUD_NAME,
    api_key: environment_1.THIRD_PARTY_CONFIG.CLOUDINARY_API_KEY,
    api_secret: environment_1.THIRD_PARTY_CONFIG.CLOUDINARY_API_SECRET,
});
exports.default = cloudinary_1.v2;
