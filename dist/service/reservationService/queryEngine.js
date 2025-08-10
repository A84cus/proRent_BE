"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhereConditions = buildWhereConditions;
exports.buildOrderByClause = buildOrderByClause;
exports.buildIncludeFields = buildIncludeFields;
function buildWhereConditions(options) {
    const { userId, propertyOwnerId, propertyId, filters = {} } = options;
    const whereConditions = {};
    if (userId) {
        whereConditions.userId = userId;
    }
    if (propertyOwnerId) {
        whereConditions.roomType = buildPropertyOwnerFilter(propertyOwnerId);
    }
    if (propertyId) {
        whereConditions.propertyId = propertyId;
    }
    Object.assign(whereConditions, buildStatusFilter(filters.status));
    Object.assign(whereConditions, buildDateRangeFilter(filters.startDate, filters.endDate));
    Object.assign(whereConditions, buildSearchFilter(filters.search));
    Object.assign(whereConditions, buildAmountFilter(filters.minAmount, filters.maxAmount));
    return whereConditions;
}
function buildPropertyOwnerFilter(ownerId) {
    return {
        property: {
            ownerId
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
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } }
        ]
    };
}
function buildAmountFilter(minAmount, maxAmount) {
    const amountConditions = {};
    if (minAmount || maxAmount) {
        if (minAmount) {
            amountConditions.amount = Object.assign(Object.assign({}, amountConditions.amount), { gte: minAmount });
        }
        if (maxAmount) {
            amountConditions.amount = Object.assign(Object.assign({}, amountConditions.amount), { lte: maxAmount });
        }
        return { payments: amountConditions };
    }
    return {};
}
function buildOrderByClause(sortBy, sortOrder) {
    const orderBy = {};
    switch (sortBy) {
        case 'reservationNumber':
            orderBy.id = sortOrder;
            break;
        case 'startDate':
            orderBy.startDate = sortOrder;
            break;
        case 'endDate':
            orderBy.endDate = sortOrder;
            break;
        case 'totalAmount':
            orderBy.payments = { _count: sortOrder };
            break;
        default:
            orderBy[sortBy] = sortOrder;
    }
    return [orderBy];
}
function buildIncludeFields(propertyOwnerId, propertyId) {
    const includeFields = {
        RoomType: buildRoomTypeInclude(propertyOwnerId),
        Payments: buildPaymentsInclude()
    };
    if (propertyOwnerId || propertyId) {
        includeFields.user = buildUserInclude();
    }
    return includeFields;
}
function buildRoomTypeInclude(propertyOwnerId) {
    return {
        select: {
            name: true,
            basePrice: true,
            property: {
                select: Object.assign({ id: true, name: true, location: true }, (propertyOwnerId && { ownerId: true }))
            }
        }
    };
}
function buildPaymentsInclude() {
    return {
        select: {
            id: true,
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
            name: true,
            email: true,
            phone: true
        }
    };
}
