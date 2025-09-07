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
exports.handleXenditInvoiceCallback = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const config_1 = require("../../config");
const reservationMessages_1 = require("../../constants/controllers/reservation/reservationMessages");
const handleXenditInvoiceCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // --- 1. Retrieve Raw Body and Token ---
    const rawBody = req.rawBody;
    const callbackToken = req.get('X-CALLBACK-TOKEN');
    // --- 2. Basic Request Validation ---
    if (!config_1.XENDIT_WEBHOOK_TOKEN) {
        return res.status(500).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.WEBHOOK_TOKEN_MISSING);
    }
    if (!callbackToken) {
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_SIGNATURE_HEADER);
    }
    if (!rawBody) {
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_REQUEST_BODY);
    }
    // --- 3. Verify Webhook Token (Direct String Comparison) ---
    try {
        if (config_1.XENDIT_WEBHOOK_TOKEN !== callbackToken) {
            return res.status(401).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
        }
    }
    catch (verifyError) {
        return res.status(500).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.SIGNATURE_VERIFICATION_ERROR);
    }
    // --- 4. Parse and Validate Callback Payload ---
    let callbackData;
    try {
        // Convert the rawBody buffer to a string and parse JSON
        const bodyString = rawBody.toString('utf8');
        callbackData = JSON.parse(bodyString);
    }
    catch (parseError) {
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVALID_JSON_PAYLOAD);
    }
    const xenditInvoiceId = callbackData.id;
    const invoiceStatus = callbackData.status;
    if (!xenditInvoiceId) {
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_INVOICE_ID_PAYLOAD);
    }
    // --- 5. Process the Callback ---
    try {
        // --- a. Find the corresponding Payment record ---
        const paymentRecord = yield prisma_1.default.payment.findUnique({
            where: { xenditInvoiceId },
            include: {
                reservation: true
            }
        });
        if (!paymentRecord) {
            return res.status(200).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVOICE_ID_NOT_FOUND);
        }
        // --- b. Map Xendit Status to Internal Status ---
        const internalPaymentStatus = mapXenditInvoiceStatusToInternal(invoiceStatus);
        // --- c. Determine corresponding Reservation status ---
        let newReservationStatus;
        if (internalPaymentStatus === client_1.Status.CONFIRMED) {
            newReservationStatus = client_1.Status.CONFIRMED;
        }
        else if (internalPaymentStatus === client_1.Status.CANCELLED) {
            newReservationStatus = client_1.Status.CANCELLED;
        }
        // --- d. Update Database Records Atomically ---
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.payment.update({
                where: { id: paymentRecord.id },
                data: {
                    xenditCallback: callbackData, // Store raw data for reference
                    callbackStatus: invoiceStatus,
                    paymentStatus: internalPaymentStatus,
                    paidAt: callbackData.paidAt ? new Date(callbackData.paidAt) : paymentRecord.paidAt
                }
            });
            if (newReservationStatus && paymentRecord.reservationId) {
                yield tx.reservation.update({
                    where: { id: paymentRecord.reservationId },
                    data: { orderStatus: newReservationStatus }
                });
            }
        }));
        return res.status(200).send(reservationMessages_1.RESERVATION_SUCCESS_MESSAGES.WEBHOOK_PROCESSED_SUCCESSFULLY);
    }
    catch (error) {
        return res.status(200).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.WEBHOOK_ERROR_LOGGED);
    }
});
exports.handleXenditInvoiceCallback = handleXenditInvoiceCallback;
function mapXenditInvoiceStatusToInternal(xenditStatus) {
    switch (xenditStatus.toUpperCase()) {
        case 'PAID':
        case 'SETTLED':
            return client_1.Status.CONFIRMED;
        case 'EXPIRED':
        case 'FAILED':
            return client_1.Status.CANCELLED;
        case 'PENDING':
        default:
            return client_1.Status.PENDING_PAYMENT;
    }
}
