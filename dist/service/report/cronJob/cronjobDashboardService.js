"use strict";
// src/services/report/cronJob/prewarmDashboardReports.ts
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
exports.prewarmDashboardReports = prewarmDashboardReports;
exports.initiateBackgroundProcessing = initiateBackgroundProcessing;
const cronjobTrackingService_1 = require("./cronjobTrackingService");
const cronjobProcessService_1 = require("./cronjobProcessService");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../prisma"));
const reportDashboardService_1 = require("../reportDashboardService");
const cronjobHelperService_1 = require("./cronjobHelperService");
// --- Main Entry Point ---
function prewarmDashboardReports(periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (periodType, periodKey, year, month = null, batchSize = 5, delayMs = 1000) {
        const finalizedParams = yield determinePeriodParameters(periodType, periodKey, year, month);
        const { periodType: pType, periodKey: pKey } = finalizedParams;
        if (yield (0, cronjobTrackingService_1.isJobRunningForPeriod)(pType, pKey)) {
            throw new Error(`A job is already running for ${pType} ${pKey}. Skipping.`);
        }
        yield validateParameters(finalizedParams, batchSize, delayMs);
        const mainJob = yield createMainBatchJob(finalizedParams, batchSize, delayMs);
        initiateBackgroundProcessing(mainJob.id, finalizedParams, batchSize, delayMs);
        return mainJob.id;
    });
}
// --- Determine Period ---
function determinePeriodParameters(periodType, periodKey, year, month) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, cronjobHelperService_1.getDefaultPeriodParams)(periodType, periodKey, year, month);
    });
}
// --- Validate Parameters ---
function validateParameters(params, batchSize, delayMs) {
    return __awaiter(this, void 0, void 0, function* () {
        (0, cronjobHelperService_1.validateFinalPeriodParams)(params);
    });
}
// --- Create Main Job ---
function createMainBatchJob(params, batchSize, delayMs) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, cronjobTrackingService_1.createBatchJob)({
            jobType: 'PREWARM_DASHBOARD_REPORTS',
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
                failedOwnerIds: []
            }
        });
    });
}
// --- Initiate Background Processing ---
function initiateBackgroundProcessing(jobId, params, batchSize, delayMs) {
    processAllOwnersInBackground(jobId, params, batchSize, delayMs).catch(err => handleBackgroundError(jobId, err));
}
// --- Handle Background Error ---
function handleBackgroundError(jobId, error) {
    return __awaiter(this, void 0, void 0, function* () {
        console.error(`Critical error in pre-warm job ${jobId}:`, error);
        try {
            yield (0, cronjobTrackingService_1.updateBatchJob)({
                jobId,
                status: client_1.JobStatus.FAILED,
                errorMessage: `Critical error: ${error.message}`,
                completedAt: new Date()
            });
        }
        catch (updateError) {
            console.error(`Failed to update pre-warm job ${jobId} to FAILED:`, updateError);
        }
    });
}
// --- Background Processing Logic ---
function processAllOwnersInBackground(mainJobId, params, batchSize, delayMs) {
    return __awaiter(this, void 0, void 0, function* () {
        let skip = 0;
        const limit = batchSize;
        let hasMore = true;
        let totalProcessedOwners = 0;
        let totalBatchesCompleted = 0;
        const failedOwnerIds = [];
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
                // Process batch
                yield processOwnerBatchWithDashboardPrewarm(ownersBatch, mainJobId, params.periodType, params.periodKey, params.year, params.month);
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
            console.error(`Unexpected error in pre-warm job ${mainJobId}:`, error);
            yield (0, cronjobProcessService_1.finalizeMainJob)(mainJobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds, error.message);
        }
    });
}
// --- Process One Owner: Trigger Dashboard Report ---
function processOwnerBatchWithDashboardPrewarm(owners, mainJobId, periodType, periodKey, year, month) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // JS months are 0-indexed
        if (periodType === 'MONTH' && year === currentYear && month === currentMonth) {
            return;
        }
        if (periodType === 'YEAR' && year === currentYear) {
            return;
        }
        // Determine startDate/endDate from period
        const { startDate, endDate } = getPeriodRange(periodType, year, month);
        for (const owner of owners) {
            try {
                // --- 🔥 Trigger dashboard report → auto-caches ---
                yield (0, reportDashboardService_1.getOwnerDashboardReport)(owner.id, {
                    startDate,
                    endDate
                });
            }
            catch (error) {
                console.error(`Failed to pre-warm dashboard for Owner ${owner.id}:`, error.message);
            }
        }
    });
}
function getPeriodRange(periodType, year, month) {
    const start = new Date(Date.UTC(year, 0, 1)); // Jan 1
    const end = new Date(Date.UTC(year, 11, 31)); // Dec 31
    if (periodType === 'MONTH' && month !== null) {
        const monthStart = new Date(Date.UTC(year, month - 1, 1));
        const monthEnd = new Date(Date.UTC(year, month, 0)); // Last day
        return { startDate: monthStart, endDate: monthEnd };
    }
    return { startDate: start, endDate: end };
}
