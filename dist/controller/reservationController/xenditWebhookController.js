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
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../../prisma")); // Adjust the path to your Prisma client instance
const client_1 = require("@prisma/client");
const config_1 = require("../../config"); // Adjust path to your environment config
const reservationMessages_1 = require("../../constants/controllers/reservation/reservationMessages");
const handleXenditInvoiceCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received Xendit Invoice Callback');
    // --- 1. Retrieve Raw Body and Signature ---
    const rawBody = req.rawBody; // Provided by express.raw middleware
    const signature = req.get('Xendit-Signature');
    // --- 2. Basic Request Validation ---
    if (!config_1.XENDIT_WEBHOOK_TOKEN) {
        console.error('XENDIT_WEBHOOK_TOKEN is not configured.');
        return res.status(500).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.WEBHOOK_TOKEN_MISSING);
    }
    if (!signature) {
        console.warn('Missing Xendit-Signature header.');
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_SIGNATURE_HEADER);
    }
    if (!rawBody) {
        console.warn('Missing request body.');
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_REQUEST_BODY);
    }
    // --- 3. Verify Webhook Signature ---
    try {
        const expectedSignature = crypto_1.default
            .createHmac('sha256', config_1.XENDIT_WEBHOOK_TOKEN)
            .update(rawBody, 'utf8') // Ensure correct encoding for raw body
            .digest('hex');
        const trusted = crypto_1.default.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
        if (!trusted) {
            console.warn('Invalid Xendit webhook signature.');
            return res.status(401).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
        }
        console.log('Xendit webhook signature verified.');
    }
    catch (verifyError) {
        console.error('Error verifying Xendit signature:', verifyError);
        return res.status(500).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.SIGNATURE_VERIFICATION_ERROR);
    }
    // --- 4. Parse and Validate Callback Payload ---
    let callbackData;
    try {
        callbackData = JSON.parse(rawBody.toString('utf8'));
        console.log('Parsed callback data:', {
            id: callbackData.id,
            status: callbackData.status
        });
    }
    catch (parseError) {
        console.error('Error parsing Xendit callback JSON:', parseError);
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVALID_JSON_PAYLOAD);
    }
    const xenditInvoiceId = callbackData.id;
    const invoiceStatus = callbackData.status; // e.g., 'PAID', 'EXPIRED', 'FAILED'
    if (!xenditInvoiceId) {
        console.warn('Callback payload missing invoice ID.');
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_INVOICE_ID_PAYLOAD);
    }
    // --- 5. Process the Callback ---
    try {
        // --- a. Find the corresponding Payment record ---
        const paymentRecord = yield prisma_1.default.payment.findUnique({
            where: { xenditInvoiceId },
            include: {
                reservation: true // Include reservation for status update
            }
        });
        if (!paymentRecord) {
            console.warn(`Payment record not found for Xendit invoice ID: ${xenditInvoiceId}`);
            // Acknowledge receipt even if not found to prevent retries for unknown invoices.
            return res.status(200).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVOICE_ID_NOT_FOUND);
        }
        console.log(`Found payment record ${paymentRecord.id} for invoice ${xenditInvoiceId}`);
        // --- b. Map Xendit Status to Internal Status ---
        const internalPaymentStatus = mapXenditInvoiceStatusToInternal(invoiceStatus);
        console.log(`Mapped Xendit status '${invoiceStatus}' to internal status '${internalPaymentStatus}'`);
        // --- c. Determine corresponding Reservation status ---
        let newReservationStatus;
        if (internalPaymentStatus === client_1.Status.CONFIRMED) {
            newReservationStatus = client_1.Status.CONFIRMED; // Or PENDING_CONFIRMATION if further steps needed
        }
        else if (internalPaymentStatus === client_1.Status.CANCELLED) {
            newReservationStatus = client_1.Status.CANCELLED;
            // Note: If cancelling due to non-payment, consider incrementing availability.
            // This would require a transaction and data from the reservation.
        }
        // Add logic for other statuses if needed (e.g., FAILED -> CANCELLED or specific status)
        // --- d. Update Database Records Atomically ---
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Update Payment record with callback details
            yield tx.payment.update({
                where: { id: paymentRecord.id },
                data: {
                    xenditCallback: callbackData, // Store raw data for reference
                    callbackStatus: invoiceStatus,
                    paymentStatus: internalPaymentStatus,
                    paidAt: callbackData.paidAt ? new Date(callbackData.paidAt) : paymentRecord.paidAt
                }
            });
            console.log(`Updated payment record ${paymentRecord.id} status to ${internalPaymentStatus}`);
            // Update Reservation status if determined
            if (newReservationStatus && paymentRecord.reservationId) {
                yield tx.reservation.update({
                    where: { id: paymentRecord.reservationId },
                    data: {
                        orderStatus: newReservationStatus
                    }
                });
                console.log(`Updated reservation ${paymentRecord.reservationId} status to ${newReservationStatus}`);
                // Optional: Trigger post-confirmation actions (e.g., send confirmation email) here or after transaction
            }
        }));
        console.log(`Successfully processed Xendit callback for invoice ${xenditInvoiceId}`);
        // --- 6. Acknowledge Success ---
        return res.status(200).send(reservationMessages_1.RESERVATION_SUCCESS_MESSAGES.WEBHOOK_PROCESSED_SUCCESSFULLY);
    }
    catch (error) {
        console.error('Error processing Xendit callback:', error);
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
