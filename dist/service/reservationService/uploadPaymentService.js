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
exports.uploadPaymentProof = uploadPaymentProof;
const prisma_1 = __importDefault(require("../../prisma")); // Adjust path to your Prisma client
const client_1 = require("@prisma/client");
const Image_service_1 = require("./Image.service"); // Adjust path to your cloudinary utility
const paymentProofValidation_1 = require("../../validations/paymentProofValidation"); // Adjust path
function uploadPaymentProof(reservationId, userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // --- 1. Authorization & Initial Reservation Validation ---
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                payment: true,
                PaymentProof: {
                    include: {
                        picture: true
                    }
                },
                RoomType: true, // Include for potential use (e.g., alt text generation)
                Property: true // Include for potential use
            }
        });
        if (!reservation) {
            throw new Error('Reservation not found.');
        }
        if (reservation.userId !== userId) {
            throw new Error('Unauthorized: You can only upload proof for your own reservations.');
        }
        if (reservation.orderStatus !== client_1.Status.PENDING_PAYMENT) {
            throw new Error('Payment proof can only be uploaded for reservations pending payment.');
        }
        if (((_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.method) !== 'MANUAL_TRANSFER') {
            throw new Error('Payment proof upload is only allowed for manual transfer payments.');
        }
        if (reservation.PaymentProof) {
            throw new Error('Payment proof already uploaded for this reservation.');
        }
        // --- 2. Zod Validation of File Metadata ---
        const fileValidationData = {
            originalname: file.originalname,
            size: file.size,
            type: 'proof'
        };
        const validationResult = paymentProofValidation_1.paymentProofFileSchema.safeParse(fileValidationData);
        if (!validationResult.success) {
            const errorMessages = validationResult.error.issues.map(e => e.message).join(', ');
            throw new Error(`File validation failed: ${errorMessages}`);
        }
        let cloudinaryUrl;
        try {
            cloudinaryUrl = yield (0, Image_service_1.uploadImage)(file, 'payment_proofs');
            if (!cloudinaryUrl) {
                throw new Error('Cloudinary upload did not return a URL.');
            }
        }
        catch (uploadError) {
            console.error('Error uploading file to Cloudinary:', uploadError);
            throw new Error(`Failed to upload payment proof to storage: ${uploadError.message || uploadError}`);
        }
        // --- 4. Database Transaction ---
        return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // a. Create the Picture record
            const pictureRecord = yield tx.picture.create({
                data: {
                    url: cloudinaryUrl,
                    alt: validationResult.data.alt || `Payment proof for ${((_a = reservation.Property) === null || _a === void 0 ? void 0 : _a.name) || 'property'} reservation`, // Generate alt if not provided
                    type: 'proof',
                    sizeKB: Math.round(file.size / 1024),
                    uploadedAt: new Date()
                }
            });
            yield tx.paymentProof.create({
                data: {
                    reservationId: reservation.id,
                    pictureId: pictureRecord.id
                }
            });
            const updatedReservation = yield tx.reservation.update({
                where: { id: reservation.id },
                data: {
                    orderStatus: client_1.Status.PENDING_CONFIRMATION
                },
                include: {
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            method: true,
                            paymentStatus: true,
                            payerEmail: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    },
                    PaymentProof: {
                        select: {
                            id: true,
                            pictureId: true,
                            picture: {
                                select: {
                                    id: true,
                                    url: true,
                                    alt: true,
                                    type: true,
                                    sizeKB: true,
                                    uploadedAt: true
                                }
                            }
                        }
                    },
                    RoomType: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    Property: {
                        select: {
                            id: true,
                            name: true,
                            location: true
                        }
                    }
                }
            });
            if ((_b = reservation.payment) === null || _b === void 0 ? void 0 : _b.id) {
                yield tx.payment.update({
                    where: { id: reservation.payment.id },
                    data: {
                        paymentStatus: client_1.Status.PENDING_CONFIRMATION
                    }
                });
            }
            return updatedReservation;
        }));
    });
}
