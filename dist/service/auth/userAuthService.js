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
const passwordService_1 = __importDefault(require("./passwordService"));
const logger_1 = __importDefault(require("../../utils/system/logger"));
const prisma_1 = __importDefault(require("../../prisma"));
class UserAuthService {
    // Get user with password for authentication
    getUserWithPassword(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, password: true }
            });
        });
    }
    // Validate password change request
    validatePasswordChangeRequest(currentPassword, newPassword) {
        const errors = [];
        if (!currentPassword || !newPassword) {
            errors.push('Current password and new password are required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Verify current password
    verifyCurrentPassword(currentPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield passwordService_1.default.verifyPassword(currentPassword, hashedPassword);
        });
    }
    // Validate new password strength
    validateNewPassword(newPassword) {
        return passwordService_1.default.validatePasswordStrength(newPassword);
    }
    // Hash new password
    hashNewPassword(newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield passwordService_1.default.hashPassword(newPassword);
        });
    }
    // Update user password
    updateUserPassword(userId, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.default.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });
            logger_1.default.info(`Password changed for user ID: ${userId}`);
        });
    }
}
exports.default = new UserAuthService();
