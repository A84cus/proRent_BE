"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionUserReportQuery = exports.TransactionReportQuery = void 0;
// services/report/reportQueryService.ts
exports.TransactionReportQuery = {
    id: true,
    startDate: true,
    endDate: true,
    orderStatus: true,
    createdAt: true,
    propertyId: true,
    Property: {
        select: {
            name: true
        }
    },
    roomTypeId: true,
    RoomType: {
        select: {
            name: true
        }
    },
    userId: true,
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
        select: {
            amount: true
        }
    }
};
exports.TransactionUserReportQuery = {
    userId: true,
    payment: {
        select: {
            amount: true // This is Float, will convert to Decimal for aggregation
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
    }
};
