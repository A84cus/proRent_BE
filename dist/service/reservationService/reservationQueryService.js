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
exports.queryReservations = queryReservations;
exports.getUserReservations = getUserReservations;
exports.getOwnerReservations = getOwnerReservations;
exports.getPropertyReservations = getPropertyReservations;
exports.getReservationWithPayment = getReservationWithPayment;
// services/reservationService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const queryEngine_1 = require("./queryEngine");
const reservationQueryHelper_1 = require("./reservationQueryHelper");
function queryReservations(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const validatedOptions = (0, reservationQueryHelper_1.validateQueryOptions)(options);
        const { userId, propertyOwnerId, propertyId, roomTypeId, page = validatedOptions.page, limit = validatedOptions.limit, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = options;
        const skip = (page - 1) * limit;
        const whereConditions = (0, queryEngine_1.buildWhereConditions)({
            userId,
            propertyOwnerId,
            propertyId,
            roomTypeId,
            filters
        });
        const orderBy = (0, queryEngine_1.buildOrderByClause)(sortBy, sortOrder);
        const includeFields = (0, queryEngine_1.buildIncludeFields)(propertyOwnerId, propertyId);
        return yield executeReservationQuery(whereConditions, orderBy, includeFields, skip, limit, page, filters);
    });
}
function executeReservationQuery(whereConditions, orderBy, includeFields, skip, limit, page, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const [reservations, totalCount] = yield Promise.all([
            prisma_1.default.reservation.findMany({
                where: whereConditions,
                include: includeFields,
                orderBy,
                skip,
                take: limit
            }),
            prisma_1.default.reservation.count({
                where: whereConditions
            })
        ]);
        const pagination = (0, reservationQueryHelper_1.calculatePagination)(page, limit, totalCount);
        return {
            reservations,
            pagination
        };
    });
}
// Convenience functions
function getUserReservations(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, options = {}) {
        return queryReservations(Object.assign({ userId }, options));
    });
}
function getOwnerReservations(propertyOwnerId_1) {
    return __awaiter(this, arguments, void 0, function* (propertyOwnerId, options = {}) {
        return queryReservations(Object.assign({ propertyOwnerId }, options));
    });
}
function getPropertyReservations(propertyOwnerId_1, propertyId_1) {
    return __awaiter(this, arguments, void 0, function* (propertyOwnerId, propertyId, options = {}) {
        return queryReservations(Object.assign({ propertyOwnerId, propertyId }, options));
    });
}
function getReservationWithPayment(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const includeFields = (0, queryEngine_1.buildIncludeFields)();
            const reservationWithPayment = yield prisma_1.default.reservation.findUnique({
                where: {
                    id: reservationId
                },
                include: includeFields
            });
            return reservationWithPayment;
        }
        catch (error) {
            console.error(`Error fetching reservation with payment for ID ${reservationId}:`, error);
            throw error;
        }
    });
}
