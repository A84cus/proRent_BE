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
// services/uploadPaymentProofService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const uploadService_1 = __importDefault(require("../uploadService"));
const client_1 = require("@prisma/client");
function uploadPaymentProof(reservationId, userId, fileBuffer, originalFilename) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const reservation = yield prisma_1.default.reservation.findUnique({
            where: { id: reservationId },
            include: {
                payment: true,
                PaymentProof: {
                    include: {
                        picture: true
                    }
                }
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
        // Check if the payment method is MANUAL_TRANSFER
        if (((_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.method) !== 'MANUAL_TRANSFER') {
            throw new Error('Payment proof upload is only allowed for manual transfer payments.');
        }
        if (reservation.PaymentProof) {
            throw new Error('Payment proof already uploaded for this reservation.');
        }
        const fileExtension = (_b = originalFilename.split('.').pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
        const allowedExtensions = ['jpg', 'jpeg', 'png']; // Requirement
        const maxFileSizeBytes = 1 * 1024 * 1024; // 1MB in bytes // Requirement
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            throw new Error('Invalid file type. Only .jpg and .png files are allowed.');
        }
        if (fileBuffer.length > maxFileSizeBytes) {
            throw new Error('File size exceeds the maximum allowed size of 1MB.');
        }
        let uploadServiceResult;
        try {
            uploadServiceResult = yield uploadService_1.default.processFileUpload({
                buffer: fileBuffer,
                originalname: originalFilename,
                type: 'proof',
                alt: `Payment proof for reservation ${reservationId}`
            });
            console.log('File uploaded via UploadService:', uploadServiceResult.id); // This should be the Picture ID
        }
        catch (uploadError) {
            console.error('Error uploading file via UploadService:', uploadError);
            throw new Error(`Failed to upload payment proof: ${uploadError.message}`);
        }
        const pictureId = uploadServiceResult.id;
        if (!pictureId) {
            // Defensive check
            throw new Error('Failed to retrieve Picture ID after upload.');
        }
        return yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield tx.paymentProof.create({
                data: {
                    reservationId: reservation.id,
                    pictureId
                }
            });
            const updatedReservation = yield tx.reservation.update({
                where: { id: reservation.id },
                data: {
                    orderStatus: client_1.Status.PENDING_CONFIRMATION
                },
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
            if ((_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.id) {
                yield tx.payment.update({
                    where: { id: (_b = reservation.payment) === null || _b === void 0 ? void 0 : _b.id },
                    data: {
                        paymentStatus: client_1.Status.PENDING_CONFIRMATION
                    }
                });
            }
            return updatedReservation;
        }));
    });
}
