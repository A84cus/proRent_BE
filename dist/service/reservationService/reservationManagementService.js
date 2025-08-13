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
// --- Placeholder for the email sending function ---
// You will replace this with your actual email sending logic later.
function sendConfirmationEmail(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[PLACEHOLDER] Sending confirmation email for reservation ID: ${reservationId}`);
        // TODO: Implement actual email sending logic here
        // });
    });
}
// --- Helper function to find and validate reservation for owner actions ---
function findAndValidateReservationForOwner(reservationId, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Replace 'any' with your Reservation type if available
        var _a;
        console.log(`Running expiry check before processing reservation ${reservationId} for owner ${ownerId}.`);
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
                    orderStatus: client_1.Status.PENDING_PAYMENT
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
            console.log(`Reservation ${reservationId} rejected by owner ${ownerId}. Status changed to PENDING_PAYMENT.`);
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
// --- Service function to confirm a reservation by the owner ---
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
                    orderStatus: client_1.Status.CONFIRMED
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
                // --- Prepare data for the email ---
                // Use the 'reservation' object fetched by findAndValidateReservationForOwner
                // which should have the User (with profile) and other details.
                // Check if required data is present
                if (!reservation.User || !reservation.User.email) {
                    throw new Error('User email not found for reservation.');
                }
                // Prepare UserWithProfile object (ensure it matches your interface)
                const userWithProfile = Object.assign(Object.assign({}, reservation.User), { profile: reservation.User.profile || null // Ensure profile is handled even if null
                 });
                // Prepare BookingDetails object (ensure it matches your interface)
                // Adjust field names based on your Prisma schema and BookingDetails interface
                const bookingDetails = {
                    id: reservation.id,
                    propertyName: ((_a = reservation.Property) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
                    roomTypeName: ((_b = reservation.RoomType) === null || _b === void 0 ? void 0 : _b.name) || 'N/A',
                    checkIn: reservation.startDate,
                    checkOut: reservation.endDate,
                    totalAmount: ((_c = reservation.payment) === null || _c === void 0 ? void 0 : _c.amount) || 0, // Assuming amount is total price
                    paymentStatus: ((_d = reservation.payment) === null || _d === void 0 ? void 0 : _d.paymentStatus) || 'N/A'
                };
                // --- Send the email using the EmailService ---
                yield emailService_1.default.sendBookingConfirmation(userWithProfile, bookingDetails);
                console.log(`Booking confirmation email sent successfully to ${reservation.User.email} for reservation ${reservationId}.`);
            }
            catch (emailError) {
                console.error(`Failed to send booking confirmation email for reservation ${reservationId} to ${((_e = reservation.User) === null || _e === void 0 ? void 0 : _e.email) || 'N/A'}:`, emailError);
                // Depending on your requirements, decide if email failure should affect the confirmation process.
                // For now, we log the error but consider the confirmation successful.
                // You might want to store email status in the DB (e.g., in EmailLog).
                // If you want to signal email failure to the controller, you could re-throw or attach info.
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
