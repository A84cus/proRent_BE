"use strict";
// Main Controllers Export - Clean Code Organization
// Import all controllers from their respective folders
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
// Base Controller (foundation for all controllers)
var BaseController_1 = require("./BaseController");
Object.defineProperty(exports, "BaseController", { enumerable: true, get: function () { return __importDefault(BaseController_1).default; } });
// Authentication Controllers
__exportStar(require("./auth"), exports);
// Property Controllers
__exportStar(require("./property"), exports);
// User Controllers
__exportStar(require("./user"), exports);
// Upload Controllers
__exportStar(require("./upload"), exports);
// System Controllers
__exportStar(require("./system"), exports);
// Reservation Controllers (existing folder structure)
__exportStar(require("./reservationController"), exports);
