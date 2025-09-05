"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhereConditions = buildWhereConditions;
exports.buildOrderByClause = buildOrderByClause;
exports.buildIncludeFields = buildIncludeFields;
const buildInclude_1 = require("./buildInclude");
function buildWhereConditions(options) {
    const { userId, propertyOwnerId, propertyId, roomTypeId, filters = {} } = options;
    const whereConditions = {};
    if (userId) {
        whereConditions.userId = userId;
    }
    if (propertyId && propertyOwnerId) {
        whereConditions.property = {
            id: propertyId,
            ownerId: propertyOwnerId
        };
    }
    else {
        if (propertyId) {
            whereConditions.propertyId = propertyId;
        }
        if (propertyOwnerId) {
            whereConditions.RoomType = buildPropertyOwnerFilter(propertyOwnerId);
        }
    }
    if (roomTypeId) {
        whereConditions.roomTypeId = roomTypeId;
    }
    // 6. Apply additional filters
    Object.assign(whereConditions, buildStatusFilter(filters.status));
    Object.assign(whereConditions, buildDateRangeFilter(filters.startDate, filters.endDate));
    Object.assign(whereConditions, buildSearchFilter(filters.search));
    Object.assign(whereConditions, buildAmountFilter(filters.minAmount, filters.maxAmount));
    return whereConditions;
}
function buildPropertyOwnerFilter(OwnerId) {
    return {
        property: {
            OwnerId
        }
    };
}
function buildStatusFilter(status) {
    return status ? { orderStatus: status } : {};
}
function buildDateRangeFilter(startDate, endDate) {
    if (!startDate && !endDate) {
        return {};
    }
    const conditions = { AND: [] };
    if (startDate) {
        conditions.AND.push({
            OR: [{ startDate: { gte: startDate } }, { endDate: { gte: startDate } }]
        });
    }
    if (endDate) {
        conditions.AND.push({
            OR: [{ startDate: { lte: endDate } }, { endDate: { lte: endDate } }]
        });
    }
    return conditions;
}
function buildSearchFilter(search) {
    if (!search) {
        return {};
    }
    return {
        OR: [
            { id: { contains: search, mode: 'insensitive' } },
            { roomTypeId: { contains: search, mode: 'insensitive' } },
            { RoomType: { name: { contains: search, mode: 'insensitive' } } },
            { RoomType: { property: { name: { contains: search, mode: 'insensitive' } } } },
            { payment: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
            { User: { email: { contains: search, mode: 'insensitive' } } },
            { User: { profile: { firstName: { contains: search, mode: 'insensitive' } } } },
            { User: { profile: { lastName: { contains: search, mode: 'insensitive' } } } }
        ]
    };
}
function buildAmountFilter(minAmount, maxAmount) {
    const amountConditions = {};
    if (minAmount !== undefined || maxAmount !== undefined) {
        if (minAmount !== undefined) {
            amountConditions.amount = Object.assign(Object.assign({}, amountConditions.amount), { gte: minAmount });
        }
        if (maxAmount !== undefined) {
            amountConditions.amount = Object.assign(Object.assign({}, amountConditions.amount), { lte: maxAmount });
        }
        return { payment: amountConditions };
    }
    return {};
}
function buildOrderByClause(sortBy, sortOrder) {
    const orderBy = [];
    switch (sortBy) {
        case 'reservationNumber':
            orderBy.push({ id: sortOrder });
            break;
        case 'invoiceNumber':
            orderBy.push({ payment: { invoiceNumber: sortOrder } });
            break;
        case 'property.name':
            orderBy.push({ RoomType: { property: { name: sortOrder } } });
            break;
        case 'RoomType.name':
            orderBy.push({ RoomType: { name: sortOrder } });
            break;
        case 'startDate':
            orderBy.push({ startDate: sortOrder });
            break;
        case 'endDate':
            orderBy.push({ endDate: sortOrder });
            break;
        case 'totalAmount':
            orderBy.push({ payment: { amount: sortOrder } });
            break;
        default:
            orderBy.push({ [sortBy]: sortOrder });
            break;
    }
    return orderBy;
}
function buildIncludeFields(propertyOwnerId, propertyId) {
    const includeFields = {
        RoomType: (0, buildInclude_1.buildRoomTypeInclude)(propertyOwnerId),
        payment: (0, buildInclude_1.buildPaymentsInclude)(),
        PaymentProof: (0, buildInclude_1.buildPaymentProofInclude)(),
        review: (0, buildInclude_1.buildReviewInclude)()
    };
    if (propertyOwnerId || propertyId) {
        includeFields.User = (0, buildInclude_1.buildUserInclude)();
    }
    return includeFields;
}
