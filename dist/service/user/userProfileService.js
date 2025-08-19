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
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("../../utils/system/logger"));
const prisma = new client_1.PrismaClient();
class UserProfileService {
    // Get user profile with all related data
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    isVerified: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            phone: true,
                            birthDate: true,
                            address: true,
                            avatar: {
                                select: {
                                    id: true,
                                    url: true,
                                    alt: true,
                                },
                            },
                            location: {
                                select: {
                                    id: true,
                                    name: true,
                                    city: {
                                        select: {
                                            name: true,
                                            province: {
                                                select: {
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });
        });
    }
    // Format profile data for response
    formatProfileData(user) {
        var _a, _b, _c, _d, _e, _f, _g;
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: {
                firstName: ((_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName) || null,
                lastName: ((_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName) || null,
                phone: ((_c = user.profile) === null || _c === void 0 ? void 0 : _c.phone) || null,
                avatar: ((_d = user.profile) === null || _d === void 0 ? void 0 : _d.avatar)
                    ? {
                        id: user.profile.avatar.id,
                        url: user.profile.avatar.url,
                        alt: user.profile.avatar.alt,
                    }
                    : null,
                birthDate: ((_e = user.profile) === null || _e === void 0 ? void 0 : _e.birthDate) || null,
                address: ((_f = user.profile) === null || _f === void 0 ? void 0 : _f.address) || null,
                location: ((_g = user.profile) === null || _g === void 0 ? void 0 : _g.location)
                    ? {
                        id: user.profile.location.id,
                        name: user.profile.location.name,
                        city: {
                            name: user.profile.location.city.name,
                            province: {
                                name: user.profile.location.city.province.name,
                            },
                        },
                    }
                    : null,
            },
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    // Update user profile
    updateUserProfile(userId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, phone, birthDate, address } = profileData;
            // Parse birthDate if provided
            let parsedBirthDate;
            if (birthDate) {
                parsedBirthDate = new Date(birthDate);
                if (isNaN(parsedBirthDate.getTime())) {
                    throw new Error("Invalid birth date format");
                }
            }
            const updatedProfile = yield prisma.profile.upsert({
                where: { userId },
                update: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (firstName !== undefined && { firstName })), (lastName !== undefined && { lastName })), (phone !== undefined && { phone })), (parsedBirthDate && { birthDate: parsedBirthDate })), (address !== undefined && { address })),
                create: {
                    userId,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    phone: phone || null,
                    birthDate: parsedBirthDate || null,
                    address: address || null,
                },
                include: {
                    avatar: {
                        select: {
                            id: true,
                            url: true,
                            alt: true,
                        },
                    },
                },
            });
            logger_1.default.info(`Profile updated for user ID: ${userId}`);
            return {
                firstName: updatedProfile.firstName,
                lastName: updatedProfile.lastName,
                name: `${updatedProfile.firstName || ""} ${updatedProfile.lastName || ""}`.trim() || null,
                phone: updatedProfile.phone,
                birthDate: updatedProfile.birthDate,
                address: updatedProfile.address,
                avatar: updatedProfile.avatar,
            };
        });
    }
    // Check if user exists
    checkUserExists(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true },
            });
        });
    }
}
exports.default = new UserProfileService();
