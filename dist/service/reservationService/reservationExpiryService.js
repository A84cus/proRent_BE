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
exports.cancelExpiredReservations = cancelExpiredReservations;
exports.runExpiryCheckManually = runExpiryCheckManually;
// services/reservationExpiryService.ts
const prisma_1 = __importDefault(require("../../prisma")); // Adjust the path if necessary
const client_1 = require("@prisma/client");
const availabilityService_1 = require("./availabilityService");
function cancelExpiredReservations() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const cancelledReservationIds = [];
        try {
            const expiredReservations = yield prisma_1.default.reservation.findMany({
                where: {
                    orderStatus: client_1.Status.PENDING_PAYMENT,
                    expiresAt: {
                        lt: now
                    },
                    payment: {
                        paymentStatus: client_1.Status.PENDING_PAYMENT
                    }
                },
                include: {
                    RoomType: {
                        select: {
                            id: true
                        }
                    },
                    payment: {
                        select: {
                            id: true,
                            paymentStatus: true
                        }
                    }
                }
            });
            if (expiredReservations.length === 0) {
                console.log('No expired reservations found.');
                return { cancelledReservationIds };
            }
            console.log(`Found ${expiredReservations.length} expired reservation(s). Processing cancellations...`);
            for (const reservation of expiredReservations) {
                try {
                    yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const updatedReservation = yield tx.reservation.update({
                            where: { id: reservation.id },
                            data: { orderStatus: client_1.Status.CANCELLED }
                        });
                        console.log(`Reservation ${reservation.id} status updated to CANCELLED.`);
                        const updatedPayment = yield tx.payment.updateMany({
                            where: { reservationId: reservation.id }, // Match payments for this specific reservation
                            data: { paymentStatus: client_1.Status.CANCELLED }
                        });
                        console.log(`Payment(s) for reservation ${reservation.id} status updated to CANCELLED. Count: ${updatedPayment.count}`);
                        if (((_a = reservation.RoomType) === null || _a === void 0 ? void 0 : _a.id) && reservation.startDate && reservation.endDate) {
                            yield (0, availabilityService_1.incrementAvailability)(tx, // Pass the transaction client
                            reservation.RoomType.id, new Date(reservation.startDate), new Date(reservation.endDate));
                            console.log(`Availability restored for RoomTypeId ${reservation.RoomType.id} from ${reservation.startDate} to ${reservation.endDate} due to reservation ${reservation.id} expiry.`);
                        }
                        else {
                            console.warn(`Could not restore availability for expired reservation ${reservation.id}: Missing RoomTypeId or dates.`);
                        }
                        cancelledReservationIds.push(reservation.id);
                    }), { timeout: 30000 });
                }
                catch (error) {
                    console.error(`Error cancelling reservation ${reservation.id}:`, error);
                    throw error(`Error cancelling reservation ${reservation.id}: ${error.message}`);
                }
            }
            console.log(`Finished processing expired reservations. Cancelled IDs: ${cancelledReservationIds.join(', ')}`);
            return { cancelledReservationIds };
        }
        catch (error) {
            console.error('Error finding or cancelling expired reservations:', error);
            throw error;
        }
    });
}
// --- Optional: Function to run the check manually (e.g., for testing) ---
function runExpiryCheckManually() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Running manual reservation expiry check...');
        try {
            const result = yield cancelExpiredReservations();
            console.log('Manual check completed. Result:', result);
        }
        catch (err) {
            console.error('Manual check failed:', err);
        }
    });
}
