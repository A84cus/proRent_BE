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
    console.log('=== START: XENDIT WEBHOOK CALLBACK ===');
    console.log('DEBUG: [1] XENDIT_WEBHOOK_TOKEN value is:', config_1.XENDIT_WEBHOOK_TOKEN);
    console.log('DEBUG: [2] Received Xendit Invoice Callback at:', new Date().toISOString());
    // --- Log ALL incoming headers for maximum debugging ---
    console.log('DEBUG: [3] FULL INCOMING HEADERS:', JSON.stringify(req.headers, null, 2));
    // --- 1. Retrieve Raw Body and Token ---
    const rawBody = req.rawBody; // Provided by our custom rawBodyMiddleware
    const callbackToken = req.get('X-CALLBACK-TOKEN'); // Xendit sends the token in this header
    console.log('DEBUG: [4] Extracted X-CALLBACK-TOKEN header value is:', callbackToken);
    console.log('DEBUG: [5] Raw Body (first 200 chars):', rawBody ? rawBody.toString('utf8').substring(0, 200) : 'NO RAW BODY');
    // --- 2. Basic Request Validation ---
    if (!config_1.XENDIT_WEBHOOK_TOKEN) {
        console.error('ERROR: [6] XENDIT_WEBHOOK_TOKEN is not configured.');
        return res.status(500).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.WEBHOOK_TOKEN_MISSING);
    }
    if (!callbackToken) {
        console.warn('WARNING: [7] Missing X-CALLBACK-TOKEN header. Full headers were logged above.');
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_SIGNATURE_HEADER);
    }
    if (!rawBody) {
        console.warn('WARNING: [8] Missing request body.');
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_REQUEST_BODY);
    }
    // --- 3. Verify Webhook Token (Direct String Comparison) ---
    try {
        console.log('DEBUG: [9] Starting token verification process.');
        console.log('DEBUG: [10] Token from Environment:', config_1.XENDIT_WEBHOOK_TOKEN);
        console.log('DEBUG: [11] Token from Header:', callbackToken);
        // Perform a direct string comparison for the token
        if (config_1.XENDIT_WEBHOOK_TOKEN !== callbackToken) {
            console.warn('WARNING: [12] TOKEN MISMATCH!');
            console.warn('WARNING: [13] Expected:', config_1.XENDIT_WEBHOOK_TOKEN);
            console.warn('WARNING: [14] Received:', callbackToken);
            return res.status(401).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVALID_WEBHOOK_SIGNATURE);
        }
        console.log('SUCCESS: [15] Xendit webhook token verified.');
    }
    catch (verifyError) {
        console.error('ERROR: [16] Error during token verification:', verifyError);
        console.error('ERROR: [17] Stack Trace:', verifyError.stack);
        return res.status(500).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.SIGNATURE_VERIFICATION_ERROR);
    }
    // --- 4. Parse and Validate Callback Payload ---
    let callbackData;
    try {
        // Convert the rawBody buffer to a string and parse JSON
        const bodyString = rawBody.toString('utf8');
        callbackData = JSON.parse(bodyString);
        console.log('SUCCESS: [18] Parsed callback data successfully:', JSON.stringify(callbackData, null, 2));
    }
    catch (parseError) {
        console.error('ERROR: [19] Error parsing Xendit callback JSON:', parseError);
        console.error('ERROR: [20] Raw Body that failed to parse:', rawBody.toString('utf8'));
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVALID_JSON_PAYLOAD);
    }
    const xenditInvoiceId = callbackData.id;
    const invoiceStatus = callbackData.status;
    if (!xenditInvoiceId) {
        console.warn('WARNING: [21] Callback payload missing invoice ID.');
        return res.status(400).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.MISSING_INVOICE_ID_PAYLOAD);
    }
    console.log('DEBUG: [22] Processing invoice ID:', xenditInvoiceId, 'with status:', invoiceStatus);
    // --- 5. Process the Callback ---
    try {
        // --- a. Find the corresponding Payment record ---
        console.log('DEBUG: [23] Querying database for Payment with xenditInvoiceId:', xenditInvoiceId);
        const paymentRecord = yield prisma_1.default.payment.findUnique({
            where: { xenditInvoiceId },
            include: {
                reservation: true // Include reservation for status update
            }
        });
        if (!paymentRecord) {
            console.warn(`WARNING: [24] Payment record NOT FOUND for Xendit invoice ID: ${xenditInvoiceId}`);
            return res.status(200).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.INVOICE_ID_NOT_FOUND);
        }
        console.log(`SUCCESS: [25] Found payment record ${paymentRecord.id} for invoice ${xenditInvoiceId}`);
        // --- b. Map Xendit Status to Internal Status ---
        const internalPaymentStatus = mapXenditInvoiceStatusToInternal(invoiceStatus);
        console.log(`DEBUG: [26] Mapped Xendit status '${invoiceStatus}' to internal status '${internalPaymentStatus}'`);
        // --- c. Determine corresponding Reservation status ---
        let newReservationStatus;
        if (internalPaymentStatus === client_1.Status.CONFIRMED) {
            newReservationStatus = client_1.Status.CONFIRMED;
        }
        else if (internalPaymentStatus === client_1.Status.CANCELLED) {
            newReservationStatus = client_1.Status.CANCELLED;
        }
        // --- d. Update Database Records Atomically ---
        console.log('DEBUG: [27] Starting database transaction to update records.');
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
            console.log(`SUCCESS: [28] Updated payment record ${paymentRecord.id} status to ${internalPaymentStatus}`);
            if (newReservationStatus && paymentRecord.reservationId) {
                yield tx.reservation.update({
                    where: { id: paymentRecord.reservationId },
                    data: { orderStatus: newReservationStatus }
                });
                console.log(`SUCCESS: [29] Updated reservation ${paymentRecord.reservationId} status to ${newReservationStatus}`);
            }
        }));
        console.log(`SUCCESS: [30] Successfully processed Xendit callback for invoice ${xenditInvoiceId}`);
        return res.status(200).send(reservationMessages_1.RESERVATION_SUCCESS_MESSAGES.WEBHOOK_PROCESSED_SUCCESSFULLY);
    }
    catch (error) {
        console.error('CRITICAL ERROR: [31] Error processing Xendit callback:', error);
        console.error('CRITICAL ERROR: [32] Error Stack:', error.stack);
        return res.status(200).send(reservationMessages_1.RESERVATION_ERROR_MESSAGES.WEBHOOK_ERROR_LOGGED);
    }
    finally {
        console.log('=== END: XENDIT WEBHOOK CALLBACK ===\n\n');
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
