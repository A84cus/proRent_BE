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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOAD_SUCCESS_MESSAGES = exports.UPLOAD_ERROR_MESSAGES = void 0;
// Upload Constants Exports
__exportStar(require("./uploadMessages"), exports);
var uploadMessages_1 = require("./uploadMessages");
Object.defineProperty(exports, "UPLOAD_ERROR_MESSAGES", { enumerable: true, get: function () { return uploadMessages_1.UPLOAD_ERROR_MESSAGES; } });
Object.defineProperty(exports, "UPLOAD_SUCCESS_MESSAGES", { enumerable: true, get: function () { return uploadMessages_1.UPLOAD_SUCCESS_MESSAGES; } });
