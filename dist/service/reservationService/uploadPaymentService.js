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
const validations_1 = require("../../validations"); // Adjust path
const invoiceNumberService_1 = require("./invoiceNumberService");
// 1. Authorization & Initial Reservation Validation
function validateReservationAccess(reservationId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                payment: true,
                PaymentProof: {
                    include: {
                        picture: true
                    }
                },
                RoomType: true,
                Property: true
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
        return reservation;
    });
}
// 2. File Validation
function validatePaymentProofFile(file) {
    const fileValidationData = {
        originalname: file.originalname,
        size: file.size,
        type: 'proof'
    };
    const validationResult = validations_1.paymentProofFileSchema.safeParse(fileValidationData);
    if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map(e => e.message).join(', ');
        throw new Error(`File validation failed: ${errorMessages}`);
    }
    return validationResult;
}
// 3. File Upload to Cloudinary
function uploadFileToStorage(file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cloudinaryUrl = yield (0, Image_service_1.uploadImage)(file, 'payment_proofs');
            if (!cloudinaryUrl) {
                throw new Error('Cloudinary upload did not return a URL.');
            }
            return cloudinaryUrl;
        }
        catch (uploadError) {
            console.error('Error uploading file to Cloudinary:', uploadError);
            throw new Error(`Failed to upload payment proof to storage: ${uploadError.message || uploadError}`);
        }
    });
}
// 4. Generate Alt Text
function generateAltText(reservation, validationResult) {
    var _a, _b;
    const serial = ((_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.invoiceNumber)
        ? (0, invoiceNumberService_1.extractSerialFromInvoiceNumber)(reservation.payment.invoiceNumber)
        : '001';
    return (validationResult.data.alt ||
        `Payment proof for Invoice No. ${((_b = reservation.payment) === null || _b === void 0 ? void 0 : _b.invoiceNumber) || serial} reservation `);
}
// 5. Create Database Records
function createPaymentProofRecords(tx, reservation, file, cloudinaryUrl, altText) {
    return __awaiter(this, void 0, void 0, function* () {
        // a. Create the Picture record
        const pictureRecord = yield tx.picture.create({
            data: {
                url: cloudinaryUrl,
                alt: altText,
                type: 'proof',
                sizeKB: Math.round(file.size / 1024),
                uploadedAt: new Date()
            }
        });
        // b. Create Payment Proof record
        yield tx.paymentProof.create({
            data: {
                reservationId: reservation.id,
                pictureId: pictureRecord.id
            }
        });
        return pictureRecord;
    });
}
// 6. Update Reservation and Payment Status
function updateReservationStatus(tx, reservation, reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Update reservation status
        const updatedReservation = yield tx.reservation.update({
            where: { id: reservationId },
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
        // Update payment status if payment exists
        if ((_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.id) {
            yield tx.payment.update({
                where: { id: reservation.payment.id },
                data: {
                    paymentStatus: client_1.Status.PENDING_CONFIRMATION
                }
            });
        }
        return updatedReservation;
    });
}
// Main function that combines all parts
function uploadPaymentProof(reservationId, userId, file) {
    return __awaiter(this, void 0, void 0, function* () {
        // Step 1: Validate reservation access
        const reservation = yield validateReservationAccess(reservationId, userId);
        // Step 2: Validate file
        const validationResult = validatePaymentProofFile(file);
        // Step 3: Upload file to storage
        const cloudinaryUrl = yield uploadFileToStorage(file);
        // Step 4: Generate alt text
        const altText = generateAltText(reservation, validationResult);
        // Step 5 & 6: Database operations in transaction
        return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            // Create payment proof records
            yield createPaymentProofRecords(tx, reservation, file, cloudinaryUrl, altText);
            // Update reservation and payment status
            const updatedReservation = yield updateReservationStatus(tx, reservation, reservationId);
            return updatedReservation;
        }), {
            timeout: 60000
        });
    });
}
