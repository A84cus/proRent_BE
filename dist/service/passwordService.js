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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class PasswordService {
    // Hash password for storage
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.hash(password, 12);
        });
    }
    // Verify password against hash
    verifyPassword(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(plainPassword, hashedPassword);
        });
    }
    // Validate password strength
    validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push("Password must contain at least one number");
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push("Password must contain at least one special character");
        }
        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
exports.default = new PasswordService();
