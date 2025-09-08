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
const { Invoice } = xenditClient;
function createXenditInvoice(paymentId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
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
            // --- Use the Invoice API structure with CORRECT camelCase parameters ---
            const invoiceData = {
                externalId: `invoice-${paymentRecord.id}-${Date.now()}`,
                amount: paymentRecord.amount,
                currency: 'IDR',
                description: `Booking for ${(roomType === null || roomType === void 0 ? void 0 : roomType.name) || 'Accommodation'} at ${(property === null || property === void 0 ? void 0 : property.name) || 'Property'} from ${reservation.startDate.toLocaleDateString()} to ${reservation.endDate.toLocaleDateString()}`,
                // --- Customer Information ---
                customer: {
                    given_names: ((_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName) || ((_b = user.email) === null || _b === void 0 ? void 0 : _b.split('@')[0]) || 'Guest',
                    surname: ((_c = user.profile) === null || _c === void 0 ? void 0 : _c.lastName) || 'Customer',
                    email: user.email || paymentRecord.payerEmail || '',
                    mobile_number: ((_d = user.profile) === null || _d === void 0 ? void 0 : _d.phone) || ''
                },
                failure_redirect_url: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/failure?reservationId=${reservation.id}`,
                success_redirect_url: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/payment/success?reservationId=${reservation.id}`,
                // --- Items ---
                items: [
                    {
                        name: `${(roomType === null || roomType === void 0 ? void 0 : roomType.name) || 'Accommodation'} at ${(property === null || property === void 0 ? void 0 : property.name) || 'Property'}`,
                        quantity: 1,
                        price: paymentRecord.amount,
                        category: 'Accommodation',
                        url: `${index_1.BASE_FE_URL || index_1.BASE_FE_URL_ALT}/property/${property === null || property === void 0 ? void 0 : property.id}`
                    }
                ],
                // --- Metadata ---
                metadata: {
                    reservationId: reservation.id,
                    propertyId: property === null || property === void 0 ? void 0 : property.id,
                    roomTypeId: roomType === null || roomType === void 0 ? void 0 : roomType.id,
                    userId: user.id
                },
                // --- Invoice Duration (camelCase, not snake_case) ---
                invoiceDuration: 86400 // <-- CHANGED FROM invoice_duration to invoiceDuration
            };
            // --- Use Invoice.createInvoice for Invoice API ---
            const xenditInvoice = yield Invoice.createInvoice({ data: invoiceData });
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
            throw new Error(`Failed to create Xendit invoice: ${error.message}`);
        }
    });
}
