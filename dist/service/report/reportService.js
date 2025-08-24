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
exports.generateSalesReport = generateSalesReport;
exports.fetchPropertyReportData = fetchPropertyReportData;
exports.fetchRoomTypeAvailabilities = fetchRoomTypeAvailabilities;
// services/report/reportService.ts
const prisma_1 = __importDefault(require("../../prisma"));
const library_1 = require("@prisma/client/runtime/library");
const availabilityService_1 = require("../reservationService/availabilityService"); // Adjust path if needed
const client_1 = require("@prisma/client");
// --- Sales Report ---
function generateSalesReport(ownerId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { startDate, endDate, orderStatus = [client_1.Status.CONFIRMED] } = filters;
        // Define date filter for reservations
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = startDate;
        }
        if (endDate) {
            // Set end date to the end of the day for inclusive filtering
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);
            dateFilter.lte = adjustedEndDate;
        }
        // --- Fetch Raw Data ---
        const reservations = yield prisma_1.default.reservation.findMany({
            where: {
                Property: {
                    OwnerId: ownerId
                },
                orderStatus: {
                    in: orderStatus
                },
                createdAt: dateFilter
            },
            select: {
                propertyId: true,
                userId: true,
                payment: {
                    select: {
                        amount: true // This is Float in Prisma schema, but we'll aggregate as Decimal
                    }
                }
            }
        });
        // --- Aggregate Data in Memory ---
        const propertyMap = {};
        for (const reservation of reservations) {
            const propertyId = reservation.propertyId;
            const amount = new library_1.Decimal((_b = (_a = reservation.payment) === null || _a === void 0 ? void 0 : _a.amount) !== null && _b !== void 0 ? _b : 0); // Convert Float to Decimal
            const userId = reservation.userId;
            if (!propertyMap[propertyId]) {
                propertyMap[propertyId] = {
                    totalSales: new library_1.Decimal(0),
                    transactionCount: 0,
                    userIds: new Set()
                };
            }
            propertyMap[propertyId].totalSales = propertyMap[propertyId].totalSales.plus(amount);
            propertyMap[propertyId].transactionCount += 1;
            propertyMap[propertyId].userIds.add(userId);
        }
        // --- Fetch Property Names ---
        const propertyIds = Object.keys(propertyMap);
        const properties = yield prisma_1.default.property.findMany({
            where: {
                id: { in: propertyIds }
            },
            select: {
                id: true,
                name: true
            }
        });
        const propertyNameMap = {};
        properties.forEach(prop => {
            propertyNameMap[prop.id] = prop.name;
        });
        // --- Build Report Items ---
        const salesReportItems = Object.entries(propertyMap).map(([propertyId, data]) => ({
            propertyId,
            propertyName: propertyNameMap[propertyId] || 'Unknown Property',
            totalSales: data.totalSales,
            transactionCount: data.transactionCount,
            uniqueUsers: data.userIds.size
        }));
        // --- Sorting ---
        if (filters.sortBy === 'totalSales') {
            salesReportItems.sort((a, b) => b.totalSales.minus(a.totalSales).toNumber()); // Sort descending by sales
        }
        else {
            // Default sort by property name
            salesReportItems.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
        }
        return salesReportItems;
    });
}
// --- Property Report (Data Fetching) ---
function fetchPropertyReportData(ownerId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { startDate, endDate } = filters;
        const properties = yield prisma_1.default.property.findMany({
            where: Object.assign({ OwnerId: ownerId }, (filters.propertyId && { id: filters.propertyId })),
            select: {
                id: true,
                name: true,
                roomTypes: {
                    select: {
                        id: true,
                        name: true,
                        totalQuantity: true
                        // We will fetch availability records separately based on date range
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        const reportItems = properties.map(property => ({
            propertyId: property.id,
            propertyName: property.name,
            roomTypes: property.roomTypes.map(rt => ({
                roomTypeId: rt.id,
                roomTypeName: rt.name,
                totalQuantity: rt.totalQuantity,
                availability: [] // Will be populated based on date range
            }))
        }));
        return reportItems;
    });
}
function fetchRoomTypeAvailabilities(roomTypeIds, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const availabilityMap = {};
        // Generate the list of dates to check once
        const datesToCheck = (0, availabilityService_1.generateDateRange)(startDate, endDate);
        // Process each room type
        for (const roomTypeId of roomTypeIds) {
            try {
                // 1. Get the total quantity for this room type (used as default)
                const totalQuantity = yield (0, availabilityService_1.getRoomTypeTotalQuantity)(roomTypeId);
                // 2. Fetch existing availability records for these dates
                const availabilityRecords = yield (0, availabilityService_1.getAvailabilityRecords)(roomTypeId, datesToCheck);
                // 3. Build a map for quick lookup of availableCount by date string
                const availabilityLookupMap = (0, availabilityService_1.buildAvailabilityMap)(availabilityRecords);
                // 4. Construct the result array for this room type
                const availabilityData = [];
                for (const date of datesToCheck) {
                    const dateKey = date.toISOString().split('T')[0];
                    // 5. Determine available count: use record value, or default to totalQuantity
                    const availableCount = availabilityLookupMap.has(dateKey)
                        ? availabilityLookupMap.get(dateKey)
                        : totalQuantity;
                    availabilityData.push({
                        date: new Date(date),
                        availableCount
                    });
                }
                // 6. Store the result for this room type
                availabilityMap[roomTypeId] = availabilityData;
            }
            catch (error) {
                console.error(`Error fetching availability for roomTypeId ${roomTypeId}:`, error);
                availabilityMap[roomTypeId] = [];
                throw error;
            }
        }
        return availabilityMap;
    });
}
