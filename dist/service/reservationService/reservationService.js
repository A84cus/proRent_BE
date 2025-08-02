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
exports.createReservation = createReservation;
// services/createReservation.ts
const prisma_1 = __importDefault(require("../../prisma"));
const pricingService_1 = require("./pricingService");
const availabilityService_1 = require("./availabilityService");
const propertyRoomResolver_1 = require("./propertyRoomResolver");
const reservationSchema_1 = require("../../schema/reservationSchema");
const client_1 = require("@prisma/client");
function createReservation(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = validateInput(input);
        // 1. Resolve the correct Room ID using the new service
        //    This encapsulates all the property/room type logic
        const targetRoomTypeId = yield (0, propertyRoomResolver_1.resolveTargetRoomTypeId)(data.propertyId, data.roomTypeId);
        // 2. Validate availability for the determined target room
        yield validateRoomTypeAvailability(targetRoomTypeId, new Date(data.startDate), new Date(data.endDate));
        // 3. Calculate price based on the target room
        const totalPrice = yield (0, pricingService_1.calculateTotalPrice)(targetRoomTypeId, new Date(data.startDate), new Date(data.endDate));
        // 4. Set expiration time (1 hour as per requirement)
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
        // 5. Determine initial order status (Always PENDING_PAYMENT upon creation)
        const initialOrderStatus = client_1.Status.PENDING_PAYMENT;
        // 6. Perform database transaction
        return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            // a. Create the reservation with the determined room ID and status
            const reservation = yield tx.reservation.create({
                data: {
                    userId: data.userId,
                    roomTypeId: targetRoomTypeId, // Use the resolved room ID
                    propertyId: data.propertyId,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    orderStatus: initialOrderStatus, // Use the determined status
                    expiresAt
                }
            });
            // b. Create Payment record (for tracking, even for manual transfers)
            yield tx.payment.create({
                data: {
                    reservationId: reservation.id,
                    amount: totalPrice,
                    method: data.paymentType, // Store the actual payment type selected
                    paymentStatus: client_1.Status.PENDING_PAYMENT, // Payment itself starts pending
                    payerEmail: data.payerEmail || '' // Get email from input or user lookup if needed
                }
            });
            return reservation;
        }), { timeout: 30000 });
    });
}
function validateInput(input) {
    return reservationSchema_1.createReservationSchema.parse(input);
}
function validateRoomTypeAvailability(roomId, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const isAvailable = yield (0, availabilityService_1.checkAvailability)(roomId, startDate, endDate);
        if (!isAvailable) {
            throw new Error('Room is not available for selected dates');
        }
    });
}
