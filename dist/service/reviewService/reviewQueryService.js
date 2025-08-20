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
exports.getReviewsPublic = getReviewsPublic;
exports.getReviewsForOwner = getReviewsForOwner;
exports.updateReviewVisibility = updateReviewVisibility;
const prisma_1 = __importDefault(require("../../prisma"));
const reviewQueryHelper_1 = require("./reviewQueryHelper");
// --- Query: Fetch Reservation for Review Validation ---
function getReviewsPublic(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const { propertyId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchContent } = filter;
        const skip = (page - 1) * limit;
        const take = limit;
        // Build where conditions
        const whereConditions = {
            reservation: { propertyId },
            visibility: true
        };
        if (searchContent) {
            whereConditions.content = { contains: searchContent, mode: 'insensitive' };
        }
        const [reviews, total] = yield Promise.all([
            prisma_1.default.review.findMany({
                where: whereConditions,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: reviewQueryHelper_1.ReviewQueryHelper
            }),
            prisma_1.default.review.count({ where: whereConditions })
        ]);
        const totalPages = Math.ceil(total / limit);
        return { reviews, total, page, limit, totalPages };
    });
}
// --- Service: Get Reviews for Owner Management (All visibility) ---
function getReviewsForOwner(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const { propertyId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', searchContent, includeInvisible = true } = filter;
        const skip = (page - 1) * limit;
        const take = limit;
        const whereConditions = {
            reservation: { propertyId }
        };
        if (searchContent) {
            whereConditions.content = { contains: searchContent, mode: 'insensitive' };
        }
        const [reviews, total] = yield Promise.all([
            prisma_1.default.review.findMany({
                where: whereConditions,
                skip,
                take,
                orderBy: { [sortBy]: sortOrder },
                include: reviewQueryHelper_1.ReplyOwnerQueryHelper
            }),
            prisma_1.default.review.count({ where: whereConditions })
        ]);
        const totalPages = Math.ceil(total / limit);
        return { reviews, total, page, limit, totalPages };
    });
}
// --- Service: Update Review Visibility (Owner Action - Optional) ---
// If you need an explicit function for owner to change review visibility
function updateReviewVisibility(ownerId, reviewId, visibility) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // Validate owner owns the property related to the review
        const review = yield prisma_1.default.review.findUnique({
            where: { id: reviewId },
            include: {
                reservation: { select: { Property: { select: { OwnerId: true } } } }
            }
        });
        if (!review || ((_b = (_a = review.reservation) === null || _a === void 0 ? void 0 : _a.Property) === null || _b === void 0 ? void 0 : _b.OwnerId) !== ownerId) {
            throw new Error('Unauthorized or review not found.');
        }
        const updatedReview = yield prisma_1.default.review.update({
            where: { id: reviewId },
            data: { visibility },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        profile: { select: { firstName: true, lastName: true } }
                    }
                },
                OwnerReply: true
            }
        });
        return updatedReview;
    });
}
