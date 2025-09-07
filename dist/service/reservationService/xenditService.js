"use strict";
// services/xenditService.ts
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
const xendit_node_1 = __importDefault(require("xendit-node"));
const prisma_1 = __importDefault(require("../../prisma"));
const index_1 = require("../../config/index");
const xenditClient = new xendit_node_1.default({ secretKey: index_1.XENDIT_SECRET_KEY });
const { PaymentRequest } = xenditClient; // Use PaymentRequest for the v2 structure
function createXenditInvoice(paymentId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const paymentRecord = yield prisma_1.default.payment.findUnique({
            where: { id: paymentId },
            include: {
                reservation: {
                    include: {
                        User: {
                            include: {
                                profile: true
                            }
                        },
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
        // --- Use the Payment Request API v2 structure ---
        const paymentRequestData = {
            reference_id: `invoice-${paymentRecord.id}-${Date.now()}`,
            amount: paymentRecord.amount,
            currency: 'IDR',
            description: `Booking for ${(roomType === null || roomType === void 0 ? void 0 : roomType.name) || 'Accommodation'} at ${(property === null || property === void 0 ? void 0 : property.name) || 'Property'} from ${reservation.startDate.toLocaleDateString()} to ${reservation.endDate.toLocaleDateString()}`,
            // --- Customer Information ---
            customer: {
                given_names: ((_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName) || ((_b = user.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]) || 'Guest',
                surname: ((_c = user.profile) === null || _c === void 0 ? void 0 : _c.lastName) || '',
                email: user.email || paymentRecord.payerEmail || '',
                mobile_number: ((_d = user.profile) === null || _d === void 0 ? void 0 : _d.phone) || ''
            },
            // --- Redirect URLs (Top-level for Payment Request v2) ---
            success_redirect_url: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`,
            failure_redirect_url: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`,
            // --- Items ---
            items: [
                {
                    name: `${(roomType === null || roomType === void 0 ? void 0 : roomType.name) || 'Accommodation'} at ${(property === null || property === void 0 ? void 0 : property.name) || 'Property'}`,
                    quantity: 1,
                    price: paymentRecord.amount,
                    category: 'Accommodation',
                    url: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/property/${property === null || property === void 0 ? void 0 : property.id}`,
                    currency: 'IDR'
                }
            ],
            // --- Metadata ---
            metadata: {
                reservationId: reservation.id,
                propertyId: property === null || property === void 0 ? void 0 : property.id,
                roomTypeId: roomType === null || roomType === void 0 ? void 0 : roomType.id,
                userId: user.id
            }
        };
        try {
            console.log('DEBUG: Creating Xendit Payment Request with ', JSON.stringify(paymentRequestData, null, 2));
            // --- Use the correct method: createPaymentRequest ---
            const xenditPaymentRequest = yield PaymentRequest.createPaymentRequest({ data: paymentRequestData });
            console.log('Xendit Payment Request Created:', xenditPaymentRequest.id);
            // --- Extract the web URL from the actions array ---
            const webAction = (_e = xenditPaymentRequest.actions) === null || _e === void 0 ? void 0 : _e.find(action => action.urlType === 'WEB');
            const paymentUrl = webAction
                ? webAction.url
                : xenditPaymentRequest.actions &&
                    xenditPaymentRequest.actions[0] &&
                    xenditPaymentRequest.actions[0].urlType === 'WEB'
                    ? xenditPaymentRequest.actions[0].url
                    : undefined;
            if (!paymentUrl) {
                throw new Error('No payment URL found in Xendit response');
            }
            yield prisma_1.default.payment.update({
                where: { id: paymentId },
                data: {
                    xenditInvoiceId: xenditPaymentRequest.id,
                    externalInvoiceUrl: paymentUrl
                }
            });
            return {
                invoiceId: xenditPaymentRequest.id,
                invoiceUrl: paymentUrl
            };
        }
        catch (error) {
            console.error('Error creating Xendit Payment Request:', error);
            yield prisma_1.default.transactionLog.create({
                data: {
                    paymentId,
                    status: 'XENDIT_INVOICE_ERROR',
                    message: error.message || 'Unknown error creating Xendit payment request'
                }
            });
            throw new Error(`Failed to create Xendit payment request: ${error.message}`);
        }
    });
}
