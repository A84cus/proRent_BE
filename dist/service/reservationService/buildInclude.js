"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRoomTypeInclude = buildRoomTypeInclude;
exports.buildPaymentsInclude = buildPaymentsInclude;
exports.buildUserInclude = buildUserInclude;
exports.buildPaymentProofInclude = buildPaymentProofInclude;
function buildRoomTypeInclude(propertyOwnerId) {
    return {
        select: {
            name: true,
            basePrice: true,
            property: {
                select: Object.assign({ id: true, name: true, location: true }, (propertyOwnerId && { OwnerId: true }))
            }
        }
    };
}
function buildPaymentsInclude() {
    return {
        select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            method: true,
            paymentStatus: true,
            createdAt: true
        }
    };
}
function buildUserInclude() {
    return {
        select: {
            id: true,
            profile: {
                select: {
                    firstName: true,
                    lastName: true,
                    phone: true
                }
            },
            email: true
        }
    };
}
function buildPaymentProofInclude() {
    return {
        select: {
            id: true,
            picture: {
                select: {
                    id: true,
                    url: true,
                    alt: true,
                    type: true,
                    sizeKB: true,
                    uploadedAt: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    };
}
