"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const config_1 = require("../../config");
class TokenService {
    // Generate JWT token for authentication
    generateJWTToken(userId, role) {
        return jsonwebtoken_1.default.sign({ userId, role }, config_1.JWT_SECRET, { expiresIn: "7d" });
    }
    // Generate verification token for email/password reset
    generateVerificationToken() {
        const token = (0, crypto_1.randomBytes)(32).toString("hex");
        const hashedToken = (0, crypto_1.createHash)("sha256").update(token).digest("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        return { token, hashedToken, expires };
    }
    // Verify JWT token
    verifyJWTToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            throw new Error("Invalid token");
        }
    }
    // Hash token for storage
    hashToken(token) {
        return (0, crypto_1.createHash)("sha256").update(token).digest("hex");
    }
}
exports.default = new TokenService();
