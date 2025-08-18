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
exports.sendBookingReminderForTomorrow = sendBookingReminderForTomorrow;
exports.sendBookingReminderByReservationId = sendBookingReminderByReservationId;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const emailService_1 = __importDefault(require("../emailService"));
function sendBookingReminderForTomorrow() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        try {
            // Get all confirmed reservations for tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const endOfDay = new Date(tomorrow);
            endOfDay.setHours(23, 59, 59, 999);
            const reservations = yield prisma_1.default.reservation.findMany({
                where: {
                    startDate: {
                        gte: tomorrow,
                        lt: endOfDay
                    },
                    orderStatus: client_1.Status.CONFIRMED,
                    payment: {
                        paymentStatus: client_1.Status.CONFIRMED
                    }
                },
                include: {
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
                    payment: { select: { id: true, amount: true, method: true, paymentStatus: true } }
                }
            });
            console.log(`Found ${reservations.length} reservations for tomorrow`);
            // Send reminder emails for each reservation
            for (const reservation of reservations) {
                try {
                    if (!reservation.User || !reservation.User.email) {
                        console.warn(`User email not found for reservation ${reservation.id}`);
                        continue;
                    }
                    const userWithProfile = {
                        id: reservation.User.id,
                        email: reservation.User.email,
                        profile: {
                            id: (_b = (_a = reservation.User.profile) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
                            firstName: (_d = (_c = reservation.User.profile) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '',
                            lastName: (_f = (_e = reservation.User.profile) === null || _e === void 0 ? void 0 : _e.lastName) !== null && _f !== void 0 ? _f : '',
                            phone: (_h = (_g = reservation.User.profile) === null || _g === void 0 ? void 0 : _g.phone) !== null && _h !== void 0 ? _h : '',
                            address: (_k = (_j = reservation.User.profile) === null || _j === void 0 ? void 0 : _j.address) !== null && _k !== void 0 ? _k : ''
                        }
                    };
                    const bookingDetails = {
                        id: reservation.id,
                        propertyName: ((_l = reservation.Property) === null || _l === void 0 ? void 0 : _l.name) || 'N/A',
                        roomTypeName: ((_m = reservation.RoomType) === null || _m === void 0 ? void 0 : _m.name) || 'N/A',
                        checkIn: reservation.startDate.toISOString().split('T')[0],
                        checkOut: reservation.endDate.toISOString().split('T')[0],
                        totalAmount: ((_o = reservation.payment) === null || _o === void 0 ? void 0 : _o.amount) || 0,
                        paymentStatus: ((_p = reservation.payment) === null || _p === void 0 ? void 0 : _p.paymentStatus) || 'N/A'
                    };
                    yield emailService_1.default.sendBookingReminder(userWithProfile, bookingDetails);
                    console.log(`Booking reminder email sent successfully to ${reservation.User.email} for reservation ${reservation.id}`);
                }
                catch (emailError) {
                    console.error(`Failed to send booking reminder email for reservation ${reservation.id} to ${((_q = reservation.User) === null || _q === void 0 ? void 0 : _q.email) || 'N/A'}:`, emailError);
                }
            }
            console.log(`Completed sending ${reservations.length} booking reminder emails`);
            return { success: true, count: reservations.length };
        }
        catch (error) {
            console.error('Error sending booking reminder emails:', error);
            throw error;
        }
    });
}
function sendBookingReminderByReservationId(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        try {
            const reservation = yield prisma_1.default.reservation.findUnique({
                where: { id: reservationId },
                include: {
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
                    payment: { select: { id: true, amount: true, method: true, paymentStatus: true } }
                }
            });
            if (!reservation) {
                throw new Error('Reservation not found');
            }
            if (!reservation.User || !reservation.User.email) {
                throw new Error('User email not found for reservation');
            }
            const userWithProfile = {
                id: reservation.User.id,
                email: reservation.User.email,
                profile: {
                    id: (_b = (_a = reservation.User.profile) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '',
                    firstName: (_d = (_c = reservation.User.profile) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '',
                    lastName: (_f = (_e = reservation.User.profile) === null || _e === void 0 ? void 0 : _e.lastName) !== null && _f !== void 0 ? _f : '',
                    phone: (_h = (_g = reservation.User.profile) === null || _g === void 0 ? void 0 : _g.phone) !== null && _h !== void 0 ? _h : '',
                    address: (_k = (_j = reservation.User.profile) === null || _j === void 0 ? void 0 : _j.address) !== null && _k !== void 0 ? _k : ''
                }
            };
            const bookingDetails = {
                id: reservation.id,
                propertyName: ((_l = reservation.Property) === null || _l === void 0 ? void 0 : _l.name) || 'N/A',
                roomTypeName: ((_m = reservation.RoomType) === null || _m === void 0 ? void 0 : _m.name) || 'N/A',
                checkIn: reservation.startDate.toISOString().split('T')[0],
                checkOut: reservation.endDate.toISOString().split('T')[0],
                totalAmount: ((_o = reservation.payment) === null || _o === void 0 ? void 0 : _o.amount) || 0,
                paymentStatus: ((_p = reservation.payment) === null || _p === void 0 ? void 0 : _p.paymentStatus) || 'N/A'
            };
            yield emailService_1.default.sendBookingReminder(userWithProfile, bookingDetails);
            console.log(`Booking reminder email sent successfully to ${reservation.User.email} for reservation ${reservation.id}`);
            return { success: true, reservationId };
        }
        catch (error) {
            console.error(`Error sending booking reminder for reservation ${reservationId}:`, error);
            throw error;
        }
    });
}
