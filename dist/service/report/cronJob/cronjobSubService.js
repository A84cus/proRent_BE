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
exports.smartYearlyRecalculation = smartYearlyRecalculation;
const prisma_1 = __importDefault(require("../../../prisma"));
const cronjobDetailProcessService_1 = require("./cronjobDetailProcessService");
const cronjobTrackingService_1 = require("./cronjobTrackingService");
const client_1 = require("@prisma/client");
const cronjobDateService_1 = require("./cronjobDateService");
const RECENT_JOB_WINDOW_MINUTES = 10;
function smartYearlyRecalculation(year) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const targetYear = year !== null && year !== void 0 ? year : new Date().getFullYear();
        const isCurrentYear = targetYear === new Date().getFullYear();
        const now = new Date();
        console.log(`Smart yearly recalculation initiated for year ${targetYear}. Is current year: ${isCurrentYear}.`);
        // --- 1. Resume any pending or failed jobs ---
        const pendingJobs = yield (0, cronjobTrackingService_1.findPendingJobs)('RECALCULATE_ALL_OWNER_SUMMARIES', 10);
        if (pendingJobs.length > 0) {
            console.warn(`Found ${pendingJobs.length} pending jobs. Resuming processing...`);
            for (const job of pendingJobs) {
                console.log(`Resuming background processing for job ${job.id} (Status: ${job.status})`);
                // In a real system, you'd re-queue this job
                // For now, we assume the worker will pick it up
            }
            return `resumed-${pendingJobs.map(j => j.id).join(',')}`;
        }
        // --- 2. Prevent duplicate global job for this year ---
        const existingRunningJob = yield prisma_1.default.batchJob.findFirst({
            where: {
                jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
                targetPeriodType: 'YEAR',
                targetPeriodKey: `${targetYear}`,
                status: {
                    in: [client_1.JobStatus.PENDING, client_1.JobStatus.IN_PROGRESS]
                }
            }
        });
        if (existingRunningJob) {
            console.log(`A global job for YEAR ${targetYear} is already running (ID: ${existingRunningJob.id}). Skipping.`);
            return existingRunningJob.id;
        }
        const cutoffTime = new Date(now.getTime() - RECENT_JOB_WINDOW_MINUTES * 60 * 1000);
        const recentCompletedJob = yield prisma_1.default.batchJob.findFirst({
            where: {
                jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
                targetPeriodType: 'YEAR',
                targetPeriodKey: `${targetYear}`,
                status: client_1.JobStatus.COMPLETED,
                completedAt: { gte: cutoffTime }
            },
            orderBy: { completedAt: 'desc' }
        });
        if (recentCompletedJob) {
            console.log(`A successful job for YEAR ${targetYear} completed at ${(_a = recentCompletedJob === null || recentCompletedJob === void 0 ? void 0 : recentCompletedJob.completedAt) === null || _a === void 0 ? void 0 : _a.toISOString()}. ` +
                `Within ${RECENT_JOB_WINDOW_MINUTES}min window. Skipping redundant execution.`);
            return recentCompletedJob.id; // Return existing job ID
        }
        // --- 3. Create main orchestrator job ---
        const mainJob = yield (0, cronjobTrackingService_1.createBatchJob)({
            jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
            targetPeriodType: 'YEAR',
            targetPeriodKey: `${targetYear}`,
            metadata: {
                year: targetYear,
                isCurrentYear,
                phase: 'SMART_YEARLY_ORCHESTRATION',
                totalOwnersProcessed: 0,
                failedOwnerIds: [],
                description: 'Orchestrates monthly gap-filling and final yearly recalculation'
            }
        });
        console.log(`Smart yearly recalculation started for ${targetYear}. Orchestrator Job ID: ${mainJob.id}`);
        // --- 4. Get all owners ---
        const owners = yield prisma_1.default.user.findMany({
            where: { role: 'OWNER' },
            select: { id: true }
        });
        let totalProcessed = 0;
        const failedOwnerIds = [];
        for (const owner of owners) {
            try {
                if (isCurrentYear) {
                    yield handleCurrentYear(owner.id, targetYear, now);
                }
                else {
                    yield handlePastYear(owner.id, targetYear);
                }
                totalProcessed++;
            }
            catch (error) {
                console.error(`Error processing owner ${owner.id} for year ${targetYear}:`, error);
                failedOwnerIds.push(owner.id);
            }
        }
        // --- 5. Finalize orchestrator job ---
        yield (0, cronjobTrackingService_1.updateBatchJob)({
            jobId: mainJob.id,
            status: client_1.JobStatus.COMPLETED,
            completedAt: new Date(),
            metadata: {
                year: targetYear,
                totalOwnersProcessed: totalProcessed,
                failedOwnerIds,
                phase: 'COMPLETED',
                description: 'Smart yearly orchestration completed'
            }
        });
        console.log(`Smart yearly recalculation completed for ${targetYear}. Processed: ${totalProcessed}, Failed: ${failedOwnerIds.length}`);
        return mainJob.id;
    });
}
// --- For past years: recalculate all 12 months + year ---
function handlePastYear(ownerId, year) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Handling past year ${year} for owner ${ownerId}`);
        for (let month = 1; month <= 12; month++) {
            const periodKey = `${year}-${String(month).padStart(2, '0')}`;
            console.log(`Processing month ${periodKey} for owner ${ownerId} (Past Year)`);
            yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'MONTH', periodKey, year, month);
        }
        // Finally, recalculate the yearly summary
        yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'YEAR', `${year}`, year, null);
    });
}
// --- For current year: detect and fill missing months ---
function handleCurrentYear(ownerId, year, now) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentMonth = now.getMonth(); // 0-indexed (Jan = 0)
        const missingMonths = [];
        console.log(`Checking missing monthly summaries for owner ${ownerId}, year ${year} (up to month ${currentMonth + 1})`);
        for (let month = 1; month <= currentMonth; month++) {
            const periodKey = `${year}-${String(month).padStart(2, '0')}`;
            const exists = yield prisma_1.default.propertyPerformanceSummary.findFirst({
                where: {
                    periodType: 'MONTH',
                    periodKey,
                    property: { OwnerId: ownerId }
                },
                select: { id: true }
            });
            if (!exists) {
                missingMonths.push(month);
            }
        }
        if (missingMonths.length === 0) {
            console.log(`Owner ${ownerId}: All months from Jan to ${currentMonth} already have summaries.`);
        }
        else {
            const validMissingMonths = yield filterMonthsWithReservations(ownerId, year, missingMonths);
            if (validMissingMonths.length === 0) {
                console.log(`Owner ${ownerId}: Missing months have no reservation data.`);
            }
            else {
                console.log(`Owner ${ownerId}: Recalculating missing months:`, validMissingMonths);
                for (const month of validMissingMonths) {
                    const periodKey = `${year}-${String(month).padStart(2, '0')}`;
                    yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'MONTH', periodKey, year, month);
                }
            }
        }
        // Always recompute the YEAR summary after ensuring monthly data is up to date
        yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'YEAR', `${year}`, year, null);
    });
}
// --- Helper: check if a month has CONFIRMED reservations ---
function filterMonthsWithReservations(ownerId, year, months) {
    return __awaiter(this, void 0, void 0, function* () {
        const properties = yield prisma_1.default.property.findMany({
            where: { OwnerId: ownerId },
            select: { id: true }
        });
        const propertyIds = properties.map(p => p.id);
        if (propertyIds.length === 0) {
            console.log(`Owner ${ownerId}: No properties found. Skipping month validation.`);
            return [];
        }
        const validMonths = [];
        for (const month of months) {
            const { startDate, endDate } = (0, cronjobDateService_1.getPeriodDateRange)('MONTH', `${year}-${String(month).padStart(2, '0')}`);
            const count = yield prisma_1.default.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    orderStatus: 'CONFIRMED',
                    startDate: { lte: endDate },
                    endDate: { gte: startDate }
                }
            });
            if (count > 0) {
                validMonths.push(month);
                console.log(`Month ${month} for owner ${ownerId} has ${count} CONFIRMED reservations. Will recalculate.`);
            }
            else {
                console.log(`Month ${month} for owner ${ownerId} has no reservations. Skipping.`);
            }
        }
        return validMonths;
    });
}
