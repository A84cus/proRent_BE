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
const passwordValidation_1 = require("../../validations/auth/passwordValidation");
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
    // Validate password strength using centralized validation
    validatePasswordStrength(password) {
        const validation = (0, passwordValidation_1.validatePasswordStrength)(password);
        return {
            isValid: validation.isValid,
            errors: validation.errors || [],
        };
    }
    // Validate password confirmation match
    validatePasswordMatch(password, confirmPassword) {
        if (password !== confirmPassword) {
            return {
                isValid: false,
                errors: ["Password and confirmation password don't match"],
            };
        }
        return {
            isValid: true,
            errors: [],
        };
    }
}
exports.default = new PasswordService();
