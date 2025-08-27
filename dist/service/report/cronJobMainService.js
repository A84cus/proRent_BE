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
exports.recalculatePropertySummaryForPeriod = recalculatePropertySummaryForPeriod;
exports.recalculateAllOwnersPropertiesSummaryForPeriod = recalculateAllOwnersPropertiesSummaryForPeriod;
exports.initiateBackgroundProcessing = initiateBackgroundProcessing;
// src/service/report/cronJobMainService.ts
const cronjobValidationService_1 = require("./cronJob/cronjobValidationService"); // Import validateRoomTypeOwnership
const cronjobDateService_1 = require("./cronJob/cronjobDateService");
const cronjobAggregationService_1 = require("./cronJob/cronjobAggregationService"); // Import RoomType aggregation functions
const PerformanceSummaryService_1 = require("./PerformanceSummaryService"); // Import upsertRoomTypePerformanceSummary
const cronjobTrackingService_1 = require("./cronJob/cronjobTrackingService");
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const cronjobProcessService_1 = require("./cronJob/cronjobProcessService"); // Import processOwnerRoomTypeBatch
const cronjobHelperService_1 = require("./cronJob/cronjobHelperService");
// --- Property Calculation ---
function recalculatePropertySummaryForPeriod(ownerId, propertyId, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, cronjobValidationService_1.validatePropertyOwnership)(ownerId, propertyId);
        const { startDate, endDate } = (0, cronjobDateService_1.getPeriodDateRange)(periodType, periodKey);
        const { totalRevenue, totalReservations } = yield (0, cronjobAggregationService_1.aggregateReservationData)(propertyId, startDate, endDate);
        if (totalReservations === 0) {
            return;
        }
        const uniqueUsers = yield (0, cronjobAggregationService_1.fetchUniqueUsers)(propertyId, startDate, endDate);
        const property = yield prisma_1.default.property.findUnique({
            where: { id: propertyId },
            select: { OwnerId: true }
        });
        if (!property) {
            throw new Error(`Property ${propertyId} not found.`);
        }
        yield (0, PerformanceSummaryService_1.upsertPropertyPerformanceSummary)({
            propertyId,
            periodType,
            periodKey,
            year,
            month,
            totalRevenue,
            totalReservations,
            uniqueUsers,
            OwnerId: property.OwnerId
        });
    });
}
// --- Global Owner Processing (Remains largely the same, calls the updated owner function) ---
function recalculateAllOwnersPropertiesSummaryForPeriod(periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (periodType, periodKey, year, month = null, batchSize = 5, delayMs = 1000) {
        const finalizedParams = yield determinePeriodParameters(periodType, periodKey, year, month);
        const { periodType: pType, periodKey: pKey } = finalizedParams;
        if (yield (0, cronjobTrackingService_1.isJobRunningForPeriod)(pType, pKey)) {
            throw new Error(`A job is already running for ${pType} ${pKey}. Skipping.`);
        }
        yield validateParameters(finalizedParams, batchSize, delayMs);
        const { isCurrentYearCalculation, previousMonthKey } = (0, cronjobDateService_1.getCurrentYearAndPreviousMonthInfo)(finalizedParams.periodType, finalizedParams.periodKey, finalizedParams.year);
        const mainJob = yield createMainBatchJob(finalizedParams, batchSize, delayMs, isCurrentYearCalculation, previousMonthKey !== null && previousMonthKey !== void 0 ? previousMonthKey : undefined);
        initiateBackgroundProcessing(mainJob.id, finalizedParams, batchSize, delayMs);
        return mainJob.id;
    });
}
function determinePeriodParameters(periodType, periodKey, year, month) {
    return __awaiter(this, void 0, void 0, function* () {
        // Delegate to helper service/function
        return (0, cronjobHelperService_1.getDefaultPeriodParams)(periodType, periodKey, year, month);
    });
}
/** Validates the finalized parameters and config. */
function validateParameters(params, batchSize, delayMs) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, cronjobHelperService_1.validateFinalPeriodParams)(params);
    });
}
/** Creates the main tracking job record. */
function createMainBatchJob(params, batchSize, delayMs, isCurrentYearCalculation, previousMonthKey) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, cronjobTrackingService_1.createBatchJob)({
            jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
            targetPeriodType: params.periodType,
            targetPeriodKey: params.periodKey,
            metadata: {
                periodType: params.periodType,
                periodKey: params.periodKey,
                year: params.year,
                month: params.month,
                batchSize,
                delayMs,
                totalOwnersProcessed: 0,
                totalBatchesCompleted: 0,
                failedOwnerIds: [],
                isCurrentYearCalculation,
                previousMonthKey
            }
        });
    });
}
/** Starts the asynchronous background processing task. */
function initiateBackgroundProcessing(jobId, params, batchSize, delayMs, isCurrentYearCalculation, previousMonthKey) {
    processAllOwnersInBackground(jobId, params.periodType, params.periodKey, params.year, params.month, batchSize, delayMs, isCurrentYearCalculation, previousMonthKey).catch(err => handleBackgroundError(jobId, err));
}
/** Handles errors occurring in the background processing task. */
function handleBackgroundError(jobId, error) {
    return __awaiter(this, void 0, void 0, function* () {
        console.error(`Critical error in background processing for job ${jobId}:`, error);
        try {
            yield (0, cronjobTrackingService_1.updateBatchJob)({
                jobId,
                status: client_1.JobStatus.FAILED,
                errorMessage: `Critical error: ${error.message}`,
                completedAt: new Date()
            });
        }
        catch (updateError) {
            console.error(`Failed to update job ${jobId} to FAILED status:`, updateError);
        }
    });
}
// --- Background Processing Logic (Calls the updated owner function) ---
function processAllOwnersInBackground(mainJobId_1, periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (mainJobId, periodType, periodKey, year, month = null, batchSize, delayMs, isCurrentYearCalculation, previousMonthKey) {
        let skip = 0;
        const limit = batchSize;
        let hasMore = true;
        let totalProcessedOwners = 0;
        let totalBatchesCompleted = 0;
        const failedOwnerIds = [];
        let lastError = null;
        try {
            yield (0, cronjobTrackingService_1.updateBatchJob)({ jobId: mainJobId, status: client_1.JobStatus.IN_PROGRESS, startedAt: new Date() });
            while (hasMore) {
                const ownersBatch = yield prisma_1.default.user.findMany({
                    where: { role: 'OWNER' },
                    select: { id: true },
                    orderBy: { id: 'asc' },
                    skip,
                    take: limit
                });
                if (ownersBatch.length === 0) {
                    hasMore = false;
                    break;
                }
                // Updated Call: Process both Property and RoomType summaries for the owner batch
                yield (0, cronjobProcessService_1.processOwnerBatch)(ownersBatch, mainJobId, periodType, periodKey, year, month, failedOwnerIds, isCurrentYearCalculation, previousMonthKey);
                totalProcessedOwners += ownersBatch.length;
                totalBatchesCompleted += 1;
                yield (0, cronjobProcessService_1.updateMainJobMetadata)(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds);
                if (ownersBatch.length < limit) {
                    hasMore = false;
                }
                else {
                    skip += limit;
                }
                if (hasMore && delayMs > 0) {
                    yield new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
            yield (0, cronjobProcessService_1.finalizeMainJob)(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds);
        }
        catch (error) {
            console.error(`Unexpected error during processing of main job ${mainJobId}:`, error);
            lastError = `Unexpected error: ${error.message}`;
            yield (0, cronjobProcessService_1.finalizeMainJob)(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds, lastError);
        }
    });
}
