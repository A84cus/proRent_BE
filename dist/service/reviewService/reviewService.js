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
exports.getEligibleReservationsForReview = getEligibleReservationsForReview;
exports.createReview = createReview;
exports.replyToReview = replyToReview;
// services/reviewService.ts
const prisma_1 = __importDefault(require("../../prisma")); // Adjust path
const client_1 = require("@prisma/client");
const reviewValidation_1 = require("../../validations/review/reviewValidation");
const reviewQueryHelper_1 = require("./reviewQueryHelper");
function getEligibleReservationsForReview(userId, propertyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const today = new Date();
        try {
            const eligibleReservations = yield prisma_1.default.reservation.findMany({
                where: {
                    userId,
                    propertyId,
                    orderStatus: client_1.Status.CONFIRMED,
                    endDate: {
                        lt: today
                    },
                    review: null,
                    payment: {
                        paymentStatus: client_1.Status.CONFIRMED
                    }
                },
                select: reviewQueryHelper_1.SelectEligibleReservations,
                orderBy: {
                    endDate: 'desc'
                }
            });
            return eligibleReservations.map(res => {
                var _a, _b, _c, _d;
                return ({
                    id: res.id,
                    propertyId: (_a = res.Property) === null || _a === void 0 ? void 0 : _a.id,
                    propertyName: ((_b = res.Property) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown Property',
                    propertyImageUrl: ((_d = (_c = res.Property) === null || _c === void 0 ? void 0 : _c.mainPicture) === null || _d === void 0 ? void 0 : _d.url) || null,
                    startDate: res.startDate,
                    endDate: res.endDate
                });
            });
        }
        catch (error) {
            console.error('Error in getEligibleReservationsForReview service:', error);
            throw new Error('Failed to fetch eligible reservations. Please try again later.');
        }
    });
}
// --- Helper: Validate Review Creation Conditions ---
function validateReviewCreation(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { userId, reservationId, rating, content } = data;
        const ratingValidation = (0, reviewValidation_1.validateReviewRating)(rating);
        if (!ratingValidation.isValid) {
            throw new Error(ratingValidation.error);
        }
        const commentValidation = (0, reviewValidation_1.validateReviewComment)(content);
        if (!commentValidation.isValid) {
            throw new Error(commentValidation.error);
        }
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                User: { select: { id: true } },
                Property: { select: { id: true, OwnerId: true } },
                review: { select: { id: true } }
            }
        });
        if (!reservation) {
            throw new Error('Reservation not found.');
        }
        // Validate ownership using centralized validation
        const ownershipValidation = (0, reviewValidation_1.validateReviewOwnership)((_a = reservation.User) === null || _a === void 0 ? void 0 : _a.id, userId);
        if (!ownershipValidation.isValid) {
            throw new Error(ownershipValidation.error);
        }
        if (reservation.review) {
            throw new Error('A review already exists for this reservation.');
        }
        if (reservation.orderStatus !== client_1.Status.CONFIRMED) {
            throw new Error('Only confirmed reservations can be reviewed.');
        }
        const today = new Date();
        const reservationEndDate = new Date(reservation.endDate);
        if (today <= reservationEndDate) {
            throw new Error('Reviews can only be submitted after the reservation end date.');
        }
    });
}
// --- Service: Create a Review ---
function createReview(input) {
    return __awaiter(this, void 0, void 0, function* () {
        yield validateReviewCreation(input);
        const { userId, reservationId, content, rating } = input;
        // Fetch reservation to get property owner (reviewee)
        const reservation = yield prisma_1.default.reservation.findUniqueOrThrow({
            where: { id: reservationId },
            select: {
                Property: {
                    select: {
                        OwnerId: true
                    }
                },
                userId: true
            }
        });
        // Double-check: ensure the userId matches the reservation's guest
        if (reservation.userId !== userId) {
            throw new Error('You can only review your own reservations.');
        }
        const newReview = yield prisma_1.default.review.create({
            data: {
                content,
                rating,
                reviewer: { connect: { id: userId } }, // Guest (reviewer)
                reviewee: { connect: { id: reservation.Property.OwnerId } }, // Host (reviewee)
                reservation: { connect: { id: reservationId } }
            },
            include: reviewQueryHelper_1.ReviewInclude
        });
        return newReview;
    });
}
// --- Helper: Validate Owner Reply Conditions ---
function validateOwnerReply(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { OwnerId, reviewId } = data;
        const review = yield prisma_1.default.review.findUnique({
            where: { id: reviewId },
            include: {
                reservation: { select: { Property: { select: { OwnerId: true } } } }
            }
        });
        if (!review) {
            throw new Error('Review not found.');
        }
        if (((_b = (_a = review.reservation) === null || _a === void 0 ? void 0 : _a.Property) === null || _b === void 0 ? void 0 : _b.OwnerId) !== OwnerId) {
            throw new Error('Unauthorized: You can only reply to reviews for your own properties.');
        }
    });
}
// --- Service: Owner Replies to a Review ---
function replyToReview(input) {
    return __awaiter(this, void 0, void 0, function* () {
        yield validateOwnerReply(input);
        const { reviewId, content } = input;
        // Use upsert to create or update the reply
        const ownerReply = yield prisma_1.default.ownerReply.upsert({
            where: { reviewId },
            update: { content },
            create: {
                content,
                review: { connect: { id: reviewId } }
            },
            include: reviewQueryHelper_1.ReplyInclude
        });
        return ownerReply;
    });
}
