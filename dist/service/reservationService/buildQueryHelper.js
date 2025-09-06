"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectionBookingQuery = rejectionBookingQuery;
exports.confirmBookingQuery = confirmBookingQuery;
exports.findAndValidateReservationQuery = findAndValidateReservationQuery;
exports.cancelQuery = cancelQuery;
exports.createUserWithProfile = createUserWithProfile;
exports.createBookingDetails = createBookingDetails;
function rejectionBookingQuery() {
    return {
        Property: {
            select: { id: true, name: true }
        },
        RoomType: {
            select: { id: true, name: true }
        },
        User: {
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        address: true
                    }
                }
            }
        },
        payment: { select: { id: true, amount: true, method: true, paymentStatus: true } },
        PaymentProof: { include: { picture: true } }
    };
}
function confirmBookingQuery() {
    return {
        Property: {
            select: { id: true, name: true }
        },
        RoomType: {
            select: { id: true, name: true }
        },
        User: {
            select: {
                id: true,
                email: true,
                profile: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        address: true
                    }
                }
            }
        },
        payment: {
            select: { id: true, amount: true, method: true, paymentStatus: true }
        },
        PaymentProof: { include: { picture: true } }
    };
}
function findAndValidateReservationQuery() {
    return {
        Property: {
            select: {
                OwnerId: true,
                name: true,
                location: true,
                roomTypes: {
                    select: {
                        name: true
                    }
                }
            }
        },
        User: {
            select: {
                email: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            }
        },
        payment: {
            select: { id: true, amount: true, method: true, paymentStatus: true }
        }
    };
}
function cancelQuery() {
    return {
        payment: {
            select: {
                id: true,
                amount: true,
                method: true,
                paymentStatus: true,
                createdAt: true,
                updatedAt: true
            }
        },
        User: {
            select: {
                id: true,
                email: true,
                role: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                }
            }
        },
        RoomType: {
            select: { id: true, name: true }
        },
        Property: {
            select: { id: true, name: true }
        }
    };
}
function createUserWithProfile(updatedReservation) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return {
        id: updatedReservation.User.id,
        email: updatedReservation.User.email,
        role: updatedReservation.User.role,
        profile: {
            id: (_b = (_a = updatedReservation.User.profile) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
            firstName: (_d = (_c = updatedReservation.User.profile) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '',
            lastName: (_f = (_e = updatedReservation.User.profile) === null || _e === void 0 ? void 0 : _e.lastName) !== null && _f !== void 0 ? _f : '',
            phone: (_h = (_g = updatedReservation.User.profile) === null || _g === void 0 ? void 0 : _g.phone) !== null && _h !== void 0 ? _h : '',
            address: (_k = (_j = updatedReservation.User.profile) === null || _j === void 0 ? void 0 : _j.address) !== null && _k !== void 0 ? _k : ''
        }
    };
}
function createBookingDetails(updatedReservation) {
    var _a, _b, _c, _d;
    return {
        id: updatedReservation.id,
        propertyName: ((_a = updatedReservation.Property) === null || _a === void 0 ? void 0 : _a.name) || 'N/A',
        roomTypeName: ((_b = updatedReservation.RoomType) === null || _b === void 0 ? void 0 : _b.name) || 'N/A',
        checkIn: updatedReservation.startDate.toISOString().split('T')[0],
        checkOut: updatedReservation.endDate.toISOString().split('T')[0],
        totalAmount: ((_c = updatedReservation.payment) === null || _c === void 0 ? void 0 : _c.amount) || 0,
        paymentStatus: ((_d = updatedReservation.payment) === null || _d === void 0 ? void 0 : _d.paymentStatus) || 'N/A'
    };
}
