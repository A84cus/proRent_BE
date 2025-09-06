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
const prisma_1 = __importDefault(require("../../prisma"));
class UserRepository {
    // Find user by email with optional include
    findByEmail(email, include) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({
                where: { email },
                include
            });
        });
    }
    // Find user by ID with optional include
    findById(id, include) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findUnique({
                where: { id },
                include
            });
        });
    }
    // Create new user
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.create({
                data
            });
        });
    }
    // Update user
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.update({
                where: { id },
                data
            });
        });
    }
    // Find user by verification token
    findByVerificationToken(hashedToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findFirst({
                where: {
                    verificationToken: hashedToken,
                    verificationExpires: {
                        gt: new Date()
                    }
                }
            });
        });
    }
    // Find user by reset token
    findByResetToken(hashedToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.default.user.findFirst({
                where: {
                    resetToken: hashedToken,
                    resetExpires: {
                        gt: new Date()
                    }
                }
            });
        });
    }
    // Clear verification token
    clearVerificationToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, {
                isVerified: true,
                verificationToken: null,
                verificationExpires: null
            });
        });
    }
    // Clear reset token
    clearResetToken(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, {
                resetToken: null,
                resetExpires: null
            });
        });
    }
    // Set verification token
    setVerificationToken(id, hashedToken, expires) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, {
                verificationToken: hashedToken,
                verificationExpires: expires
            });
        });
    }
    // Set reset token
    setResetToken(id, hashedToken, expires) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, {
                resetToken: hashedToken,
                resetExpires: expires
            });
        });
    }
    // Update password
    updatePassword(id, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.update(id, {
                password: hashedPassword
            });
        });
    }
}
exports.default = new UserRepository();
