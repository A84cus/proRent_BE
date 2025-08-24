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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPropertyPerformanceSummary = findPropertyPerformanceSummary;
exports.findPropertyPerformanceSummaries = findPropertyPerformanceSummaries;
const prisma_1 = __importDefault(require("../../prisma"));
function findPropertyPerformanceSummary(ownerId, propertyId, periodType, periodKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // First, verify the property belongs to the owner
        const propertyCheck = yield prisma_1.default.property.findUnique({
            where: {
                id: propertyId,
                OwnerId: ownerId
            },
            select: {
                id: true
            }
        });
        if (!propertyCheck) {
            // Property doesn't exist or doesn't belong to the owner
            return null;
        }
        // If ownership is valid, find the summary record
        return yield prisma_1.default.propertyPerformanceSummary.findUnique({
            where: {
                propertyId_periodType_periodKey: {
                    propertyId,
                    periodType,
                    periodKey
                }
            }
        });
    });
}
function findPropertyPerformanceSummaries(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ownerId } = filters, restFilters = __rest(filters, ["ownerId"]); // Extract ownerId
        // Start building the where clause for PropertyPerformanceSummary
        const summaryWhereClause = {};
        // Apply filters from restFilters
        if (restFilters.propertyId) {
            summaryWhereClause.propertyId = restFilters.propertyId;
        }
        if (restFilters.propertyIds && restFilters.propertyIds.length > 0) {
            summaryWhereClause.propertyId = { in: restFilters.propertyIds };
        }
        if (restFilters.periodType) {
            summaryWhereClause.periodType = restFilters.periodType;
        }
        if (restFilters.periodKey) {
            summaryWhereClause.periodKey = restFilters.periodKey;
        }
        if (restFilters.year !== undefined) {
            summaryWhereClause.year = restFilters.year;
        }
        if (restFilters.month !== undefined) {
            summaryWhereClause.month = restFilters.month;
        }
        if (restFilters.startDate || restFilters.endDate) {
            summaryWhereClause.lastUpdated = {};
            if (restFilters.startDate) {
                summaryWhereClause.lastUpdated.gte = restFilters.startDate;
            }
            if (restFilters.endDate) {
                summaryWhereClause.lastUpdated.lte = restFilters.endDate;
            }
        }
        let ownedPropertyIds = [];
        const propertyFilter = { OwnerId: ownerId }; // Base filter for owner
        // If specific property filters are given, add them to the property query
        if (restFilters.propertyId) {
            propertyFilter.id = restFilters.propertyId;
        }
        if (restFilters.propertyIds && restFilters.propertyIds.length > 0) {
            propertyFilter.id = { in: restFilters.propertyIds };
        }
        const ownedProperties = yield prisma_1.default.property.findMany({
            where: propertyFilter,
            select: {
                id: true
            }
        });
        ownedPropertyIds = ownedProperties.map(p => p.id);
        // If no properties are owned by the user matching the filters, return empty array
        if (ownedPropertyIds.length === 0) {
            return [];
        }
        // Add the owned property IDs to the summary where clause
        summaryWhereClause.propertyId = { in: ownedPropertyIds };
        return yield prisma_1.default.propertyPerformanceSummary.findMany({
            where: summaryWhereClause,
            orderBy: {
                year: 'desc',
                month: 'desc'
            }
        });
    });
}
