"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAny = exports.authOwner = exports.authUser = exports.authorize = exports.authenticate = void 0;
const client_1 = require("@prisma/client");
const authService_1 = __importDefault(require("../../service/auth/authService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const prisma = new client_1.PrismaClient();
// Authentication middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = authService_1.default.verifyToken(token);
        // Get user from database to ensure user still exists
        const user = yield authService_1.default.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Access denied. User not found.",
            });
        }
        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please verify your email.",
            });
        }
        req.user = {
            userId: user.id,
            role: user.role,
        };
        next();
    }
    catch (error) {
        logger_1.default.error("Authentication error:", error);
        return res.status(401).json({
            success: false,
            message: "Access denied. Invalid token.",
        });
    }
});
exports.authenticate = authenticate;
// Authorization middleware for specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please authenticate first.",
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions.",
            });
        }
        next();
    };
};
exports.authorize = authorize;
// Combined middleware for auth.role:user and auth.role:owner
exports.authUser = [exports.authenticate, (0, exports.authorize)("USER")];
exports.authOwner = [exports.authenticate, (0, exports.authorize)("OWNER")];
exports.authAny = [exports.authenticate]; // Any authenticated user
