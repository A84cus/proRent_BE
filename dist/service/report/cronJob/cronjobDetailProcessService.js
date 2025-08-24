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
exports.recalculateRoomTypeSummaryForPeriod = recalculateRoomTypeSummaryForPeriod;
exports.recalculateOwnerSummariesForPeriod = recalculateOwnerSummariesForPeriod;
const prisma_1 = __importDefault(require("../../../prisma"));
const cronJobMainService_1 = require("../cronJobMainService");
const reportByTimeHelperService_1 = require("../reportByTimeHelperService");
const roomTypeSummaryService_1 = require("../roomTypeSummaryService");
const cronjobAggregationService_1 = require("./cronjobAggregationService");
const cronjobDateService_1 = require("./cronjobDateService");
function recalculateRoomTypeSummaryForPeriod(ownerId, // For validation
roomTypeId, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, reportByTimeHelperService_1.validateRoomTypeOwnership)(ownerId, roomTypeId); // Ensure room type belongs to owner's property
        const { startDate, endDate } = (0, cronjobDateService_1.getPeriodDateRange)(periodType, periodKey);
        // Use specific aggregation functions for RoomType
        const { totalRevenue, totalReservations, totalNightsBooked } = yield (0, cronjobAggregationService_1.aggregateRoomTypeReservationData)(roomTypeId, startDate, endDate);
        if (totalReservations === 0) {
            console.log(`Skipping summary for Property ${roomTypeId} (${periodType} ${periodKey}) - No reservations.`);
            return; // Exit early, DO NOT call upsertPropertyPerformanceSummary
        }
        const uniqueUsers = yield (0, cronjobAggregationService_1.fetchRoomTypeUniqueUsers)(roomTypeId, startDate, endDate); // Specific unique user fetch
        // Fetch propertyId for denormalization in the summary table
        const roomType = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId },
            select: { propertyId: true }
        });
        if (!roomType) {
            throw new Error(`RoomType with ID ${roomTypeId} not found after validation.`);
        }
        yield (0, roomTypeSummaryService_1.upsertRoomTypePerformanceSummary)({
            roomTypeId,
            propertyId: roomType.propertyId, // Denormalized propertyId
            periodType,
            periodKey,
            year,
            month,
            totalRevenue,
            totalReservations,
            totalNightsBooked, // Include RoomType specific metric
            uniqueUsers,
            OwnerId: ownerId
        });
    });
}
// --- Updated Owner-Level Calculation ---
function recalculateOwnerSummariesForPeriod(ownerId_1, periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (// Renamed for clarity
    ownerId, periodType, periodKey, year, month = null, isCurrentYearCalculation, previousMonthKey) {
        const properties = yield prisma_1.default.property.findMany({
            where: { OwnerId: ownerId },
            select: { id: true }
        });
        if (properties.length === 0) {
            console.log(`No properties found for owner ${ownerId}. Skipping recalculation.`);
            return;
        }
        // --- Process Properties ---
        yield processPropertiesBatch(ownerId, properties, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey);
        // --- Process RoomTypes for all Properties ---
        // We can either iterate through properties again or fetch all room types directly.
        // Fetching directly might be slightly more efficient.
        const roomTypes = yield prisma_1.default.roomType.findMany({
            where: {
                propertyId: {
                    in: properties.map(p => p.id)
                }
            },
            select: {
                id: true
            }
        });
        if (roomTypes.length > 0) {
            yield processRoomTypesBatch(ownerId, roomTypes, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey);
        }
    });
}
// --- Property Batch Processing (Extracted/Kept) ---
function processPropertiesBatch(ownerId_1, properties_1, periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, properties, periodType, periodKey, year, month = null, isCurrentYearCalculation, previousMonthKey) {
        const promises = properties.map(prop => (0, cronJobMainService_1.recalculatePropertySummaryForPeriod)(ownerId, prop.id, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey)
            .then(() => ({ status: 'fulfilled', propertyId: prop.id })) // Return propertyId on success
            .catch(err => {
            console.error(`Error recalculating property summary for ${prop.id} (owner ${ownerId}):`, err);
            return { status: 'rejected', propertyId: prop.id, reason: err }; // Return propertyId and error on failure
        }));
        const results = yield Promise.allSettled(promises); // Changed to allSettled for individual result handling if needed later
        // Basic logging as before, or enhance based on individual results if needed
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`Property recalculation for owner ${ownerId} completed. Successful: ${successful}, Failed: ${failed}`);
    });
}
// --- New RoomType Batch Processing ---
function processRoomTypesBatch(ownerId_1, roomTypes_1, periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, roomTypes, periodType, periodKey, year, month = null, isCurrentYearCalculation, previousMonthKey) {
        const promises = roomTypes.map(rt => recalculateRoomTypeSummaryForPeriod(ownerId, rt.id, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey)
            .then(() => ({ status: 'fulfilled', roomTypeId: rt.id }))
            .catch(err => {
            console.error(`Error recalculating room type summary for ${rt.id} (owner ${ownerId}):`, err);
            return { status: 'rejected', roomTypeId: rt.id, reason: err };
        }));
        const results = yield Promise.allSettled(promises);
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`RoomType recalculation for owner ${ownerId} completed. Successful: ${successful}, Failed: ${failed}`);
    });
}
