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
const reservationSchema_1 = require("../../validations/reservationSchema");
const client_1 = require("@prisma/client");
const xenditService_1 = require("./xenditService");
function validateBooking(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetRoomTypeId = yield (0, propertyRoomResolver_1.resolveTargetRoomTypeId)(data.propertyId, data.roomTypeId);
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        const isAvailable = yield (0, availabilityService_1.checkAvailability)(targetRoomTypeId, startDate, endDate);
        if (!isAvailable) {
            throw new Error('The selected accommodation type is not available for the chosen dates.');
        }
        const totalPrice = yield (0, pricingService_1.calculateTotalPrice)(targetRoomTypeId, startDate, endDate);
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
        const initialOrderStatus = client_1.Status.PENDING_PAYMENT;
        return {
            targetRoomTypeId,
            totalPrice,
            expiresAt,
            initialOrderStatus,
            startDate,
            endDate
        };
    });
}
function executeReservationTransaction(data, validationData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { targetRoomTypeId, totalPrice, expiresAt, initialOrderStatus, startDate, endDate } = validationData;
        return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            const reservation = yield tx.reservation.create({
                data: {
                    userId: data.userId,
                    roomTypeId: targetRoomTypeId,
                    propertyId: data.propertyId,
                    startDate,
                    endDate,
                    orderStatus: initialOrderStatus,
                    expiresAt
                }
            });
            const paymentRecord = yield tx.payment.create({
                data: {
                    reservationId: reservation.id,
                    amount: totalPrice,
                    method: data.paymentType,
                    paymentStatus: client_1.Status.PENDING_PAYMENT,
                    payerEmail: data.payerEmail || ''
                }
            });
            yield (0, availabilityService_1.decrementAvailability)(tx, targetRoomTypeId, startDate, endDate);
            return { reservation, paymentRecordId: paymentRecord.id };
        }), { timeout: 30000, maxWait: 10000 });
    });
}
function handleXenditPostProcessing(paymentRecordId, reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const xenditInvoiceDetails = yield (0, xenditService_1.createXenditInvoice)(paymentRecordId);
            return {
                reservationId,
                paymentUrl: xenditInvoiceDetails.invoiceUrl,
                message: 'Reservation created, redirecting to payment.'
            };
        }
        catch (xenditError) {
            console.error('Error creating Xendit invoice after reservation:', xenditError);
            throw new Error(`Reservation created, but Xendit payment setup failed: ${xenditError.message}`);
        }
    });
}
function handleManualPostProcessing(reservation) {
    return {
        reservation,
        message: 'Reservation created. Please upload payment proof.'
    };
}
function createReservation(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = validateInput(input);
        const validationData = yield validateBooking(data);
        const { reservation, paymentRecordId } = yield executeReservationTransaction(data, validationData);
        if (data.paymentType === client_1.PaymentType.XENDIT) {
            return yield handleXenditPostProcessing(paymentRecordId, reservation.id);
        }
        else {
            return handleManualPostProcessing(reservation);
        }
    });
}
function validateInput(input) {
    return reservationSchema_1.createReservationSchema.parse(input);
}
