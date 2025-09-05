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
exports.calculateNewExpiryTime = calculateNewExpiryTime;
exports.rejectReservationByOwner = rejectReservationByOwner;
exports.confirmReservationByOwner = confirmReservationByOwner;
exports.cancelReservation = cancelReservation;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const reservationExpiryService_1 = require("./reservationExpiryService");
const emailService_1 = __importDefault(require("../email/emailService"));
const buildQueryHelper_1 = require("./buildQueryHelper");
const reservationService_1 = require("./reservationService");
function runPostRejectionExpiryCheck(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, reservationExpiryService_1.cancelExpiredReservations)();
    });
}
function calculateNewExpiryTime() {
    return new Date(Date.now() + 1 * 60 * 60 * 1000);
}
function checkFinalReservationStatus(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const finalReservationCheck = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            select: { orderStatus: true, payment: { select: { paymentStatus: true } } }
        });
        if (!finalReservationCheck) {
            throw new Error('Reservation not found after rejection.');
        }
        if (finalReservationCheck.orderStatus === client_1.Status.CANCELLED) {
            throw new Error('Reservation was automatically cancelled because it had expired.');
        }
        return finalReservationCheck; // Optional: return data if needed elsewhere
    });
}
function findAndValidateReservationForOwner(reservationId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield (0, reservationExpiryService_1.cancelExpiredReservations)();
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: (0, buildQueryHelper_1.findAndValidateReservationQuery)()
        });
        if (!reservation) {
            throw new Error('Reservation not found.');
        }
        if (((_a = reservation.Property) === null || _a === void 0 ? void 0 : _a.OwnerId) !== ownerId) {
            throw new Error('Unauthorized: You can only process reservations for your own properties.');
        }
        if (reservation.orderStatus !== client_1.Status.PENDING_CONFIRMATION) {
            if (reservation.orderStatus === client_1.Status.CONFIRMED) {
                throw new Error('Reservation is already confirmed.');
            }
            else if (reservation.orderStatus === client_1.Status.CANCELLED) {
                throw new Error('Reservation is cancelled.');
            }
            else if (reservation.orderStatus === client_1.Status.PENDING_PAYMENT) {
                throw new Error('Reservation is awaiting payment confirmation.');
            }
            else {
                throw new Error('Reservation cannot be processed at this stage.');
            }
        }
        return reservation;
    });
}
function rejectReservationByOwner(reservationId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const reservation = yield findAndValidateReservationForOwner(reservationId, ownerId);
        try {
            const updatedReservation = yield prisma_1.default.reservation.update({
                where: {
                    id: reservationId,
                    orderStatus: client_1.Status.PENDING_CONFIRMATION
                },
                data: {
                    orderStatus: client_1.Status.PENDING_PAYMENT,
                    expiresAt: calculateNewExpiryTime(),
                    payment: { update: { paymentStatus: client_1.Status.PENDING_PAYMENT } }
                },
                include: (0, buildQueryHelper_1.rejectionBookingQuery)()
            });
            yield runPostRejectionExpiryCheck(reservationId);
            try {
                if (!updatedReservation.User || !updatedReservation.User.email) {
                    throw new Error('User email not found for reservation.');
                }
                const userWithProfile = (0, buildQueryHelper_1.createUserWithProfile)(updatedReservation);
                const bookingDetails = (0, buildQueryHelper_1.createBookingDetails)(updatedReservation);
                yield emailService_1.default.sendBookingRejection(userWithProfile, bookingDetails);
            }
            catch (emailError) {
                console.error(`Failed to send booking confirmation email for reservation ${reservationId} to ${((_a = reservation.User) === null || _a === void 0 ? void 0 : _a.email) || 'N/A'}:`, emailError);
                throw emailError;
            }
            return updatedReservation;
        }
        catch (error) {
            if (error.code === 'P2025') {
                console.error(`Failed to reject reservation ${reservationId}: Record not found or status mismatch.`);
                throw new Error('Reservation could not be rejected. It might have expired and been automatically cancelled.');
            }
            console.error(`Error rejecting reservation ${reservationId}:`, error);
            throw error;
        }
    });
}
function confirmReservationByOwner(reservationId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const reservation = yield findAndValidateReservationForOwner(reservationId, ownerId);
        try {
            const updatedReservation = yield prisma_1.default.reservation.update({
                where: {
                    id: reservationId,
                    orderStatus: client_1.Status.PENDING_CONFIRMATION
                },
                data: {
                    orderStatus: client_1.Status.CONFIRMED,
                    payment: { update: { paymentStatus: client_1.Status.CONFIRMED } }
                },
                include: (0, buildQueryHelper_1.confirmBookingQuery)()
            });
            try {
                if (!updatedReservation.User || !updatedReservation.User.email) {
                    throw new Error('User email not found for reservation.');
                }
                const userWithProfile = (0, buildQueryHelper_1.createUserWithProfile)(updatedReservation);
                const bookingDetails = (0, buildQueryHelper_1.createBookingDetails)(updatedReservation);
                yield emailService_1.default.sendBookingConfirmation(userWithProfile, bookingDetails);
            }
            catch (emailError) {
                console.error(`Failed to send booking confirmation email for reservation ${reservationId} to ${((_a = reservation.User) === null || _a === void 0 ? void 0 : _a.email) || 'N/A'}:`, emailError);
                throw emailError;
            }
            return updatedReservation;
        }
        catch (error) {
            if (error.code === 'P2025') {
                console.error(`Failed to confirm reservation ${reservationId}: Record not found or status mismatch.`);
                throw new Error('Reservation could not be confirmed. It might have expired and been automatically cancelled.');
            }
            console.error(`Error confirming reservation ${reservationId}:`, error);
            throw error;
        }
    });
}
function cancelReservation(reservationId, userId, role) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reservation = yield (0, reservationService_1.findAndValidateReservation)(reservationId, userId);
            const updatedReservation = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield (0, reservationService_1.updateReservationAndPaymentStatus)(tx, reservationId);
                yield (0, reservationService_1.restoreAvailability)(tx, reservation);
                return yield tx.reservation.findUnique({
                    where: { id: reservationId },
                    include: (0, buildQueryHelper_1.cancelQuery)()
                });
            }), { timeout: 30000 });
            try {
                if (!(updatedReservation === null || updatedReservation === void 0 ? void 0 : updatedReservation.User) || !(updatedReservation === null || updatedReservation === void 0 ? void 0 : updatedReservation.User.email)) {
                    throw new Error('User email not found for reservation.');
                }
                const userWithProfile = (0, buildQueryHelper_1.createUserWithProfile)(updatedReservation);
                const bookingDetails = (0, buildQueryHelper_1.createBookingDetails)(updatedReservation);
                console.log(role);
                if (role === client_1.Role.OWNER) {
                    yield emailService_1.default.sendBookingCancelationByOwner(userWithProfile, bookingDetails);
                }
                else {
                    yield emailService_1.default.sendBookingCancelationByUser(userWithProfile, bookingDetails);
                }
            }
            catch (emailError) {
                const userWithProfile = (0, buildQueryHelper_1.createUserWithProfile)(updatedReservation);
                console.error(`Failed to send booking confirmation email for reservation ${reservationId} to ${(userWithProfile === null || userWithProfile === void 0 ? void 0 : userWithProfile.email) || 'N/A'}:`, emailError);
                throw emailError;
            }
            return updatedReservation;
        }
        catch (error) {
            if (error.code === 'P2025') {
                console.error(`Failed to cancel reservation ${reservationId}: Record not found or status mismatch.`);
                throw new Error('Reservation could not be cancelled. It might have expired and been automatically confirmed.');
            }
            console.error(`Error cancelling reservation ${reservationId}:`, error);
            throw error;
        }
    });
}
