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
exports.rejectReservationByOwner = rejectReservationByOwner;
exports.confirmReservationByOwner = confirmReservationByOwner;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const reservationExpiryService_1 = require("./reservationExpiryService");
const emailService_1 = __importDefault(require("../emailService"));
function runPostRejectionExpiryCheck(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Checking for expiry after rejecting reservation ${reservationId}...`);
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
            console.log(`Reservation ${reservationId} was automatically cancelled because it had expired.`);
            throw new Error('Reservation was automatically cancelled because it had expired.');
        }
        console.log(`Reservation ${reservationId} successfully rejected (status PENDING_PAYMENT).`);
        return finalReservationCheck; // Optional: return data if needed elsewhere
    });
}
function findAndValidateReservationForOwner(reservationId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield (0, reservationExpiryService_1.cancelExpiredReservations)();
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                Property: {
                    select: {
                        OwnerId: true,
                        name: true,
                        location: true,
                        roomTypes: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                User: {
                    select: {
                        email: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                payment: { select: { id: true, amount: true, method: true, paymentStatus: true } }
            }
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
                include: {
                    Property: {
                        select: { id: true, name: true }
                    },
                    RoomType: {
                        select: { id: true, name: true }
                    },
                    User: {
                        select: { id: true, email: true }
                    },
                    payment: { select: { id: true, amount: true, method: true } },
                    PaymentProof: { include: { picture: true } }
                }
            });
            yield runPostRejectionExpiryCheck(reservationId);
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
        var _a, _b, _c, _d, _e;
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
                include: {
                    Property: {
                        select: { id: true, name: true }
                    },
                    RoomType: {
                        select: { id: true, name: true }
                    },
                    User: {
                        select: { id: true, email: true }
                    },
                    payment: { select: { id: true, amount: true, method: true } },
                    PaymentProof: { include: { picture: true } }
                }
            });
            console.log(`Reservation ${reservationId} confirmed by owner ${ownerId}. Status changed to CONFIRMED.`);
            try {
                if (!reservation.User || !reservation.User.email) {
                    throw new Error('User email not found for reservation.');
                }
                const userWithProfile = Object.assign(Object.assign({}, reservation.User), { profile: reservation.User.profile || null });
                const bookingDetails = {
                    id: reservation.id,
                    propertyName: ((_a = reservation.Property) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                    roomTypeName: ((_b = reservation.RoomType) === null || _b === void 0 ? void 0 : _b.name) || 'N/A',
                    checkIn: reservation.startDate,
                    checkOut: reservation.endDate,
                    totalAmount: ((_c = reservation.payment) === null || _c === void 0 ? void 0 : _c.amount) || 0,
                    paymentStatus: ((_d = reservation.payment) === null || _d === void 0 ? void 0 : _d.paymentStatus) || 'N/A'
                };
                yield emailService_1.default.sendBookingConfirmation(userWithProfile, bookingDetails);
                console.log(`Booking confirmation email sent successfully to ${reservation.User.email} for reservation ${reservationId}.`);
            }
            catch (emailError) {
                console.error(`Failed to send booking confirmation email for reservation ${reservationId} to ${((_e = reservation.User) === null || _e === void 0 ? void 0 : _e.email) || 'N/A'}:`, emailError);
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
