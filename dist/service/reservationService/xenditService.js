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
exports.createXenditInvoice = createXenditInvoice;
// services/xenditService.ts
const xendit_node_1 = __importDefault(require("xendit-node"));
const prisma_1 = __importDefault(require("../../prisma")); // Adjust path
const index_1 = require("../../config/index"); // Assuming you use this for env vars
const xenditClient = new xendit_node_1.default({ secretKey: index_1.XENDIT_SECRET_KEY });
const { Invoice } = xenditClient;
function createXenditInvoice(paymentId) {
    return __awaiter(this, void 0, void 0, function* () {
        const paymentRecord = yield prisma_1.default.payment.findUnique({
            where: { id: paymentId },
            include: {
                reservation: {
                    include: {
                        User: true,
                        RoomType: true,
                        Property: true
                    }
                }
            }
        });
        if (!paymentRecord || paymentRecord.method !== 'XENDIT') {
            throw new Error('Invalid payment record for Xendit invoice creation.');
        }
        if (!paymentRecord.reservation || !paymentRecord.reservation.User) {
            throw new Error('Reservation or user data missing for Xendit invoice.');
        }
        const reservation = paymentRecord.reservation;
        const user = reservation.User;
        const roomType = reservation.RoomType;
        const property = reservation.Property;
        const invoiceData = {
            externalId: `invoice-${paymentRecord.id}-${Date.now()}`, // Unique ID for Xendit
            amount: paymentRecord.amount,
            payerEmail: user.email || paymentRecord.payerEmail || '', // Prefer user email from relation
            description: `Booking for ${(roomType === null || roomType === void 0 ? void 0 : roomType.name) || 'Accommodation'} at ${(property === null || property === void 0 ? void 0 : property.name) || 'Property'} from ${reservation.startDate.toLocaleDateString()} to ${reservation.endDate.toLocaleDateString()}`,
            invoiceDuration: 60 * 60 * 24,
            successRedirectURL: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`,
            failureRedirectURL: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`
        };
        try {
            console.log('DEBUG: Success Redirect URL:', `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`);
            console.log('DEBUG: Failure Redirect URL:', `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`);
            const xenditInvoice = yield Invoice.createInvoice({ data: invoiceData });
            console.log('Xendit Invoice Created:', xenditInvoice.id);
            yield prisma_1.default.payment.update({
                where: { id: paymentId },
                data: {
                    xenditInvoiceId: xenditInvoice.id,
                    externalInvoiceUrl: xenditInvoice.invoiceUrl
                }
            });
            return {
                invoiceId: xenditInvoice.id,
                invoiceUrl: xenditInvoice.invoiceUrl
            };
        }
        catch (error) {
            console.error('Error creating Xendit Invoice:', error);
            yield prisma_1.default.transactionLog.create({
                data: {
                    paymentId,
                    status: 'XENDIT_INVOICE_ERROR',
                    message: error.message || 'Unknown error creating Xendit invoice'
                }
            });
            throw new Error(`Failed to create Xendit invoice: ${error.message}`);
        }
    });
}
