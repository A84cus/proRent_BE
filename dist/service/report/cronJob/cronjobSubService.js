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
        const targetYear = year !== null && year !== void 0 ? year : new Date().getFullYear();
        const isCurrentYear = targetYear === new Date().getFullYear();
        const now = new Date();
        const pendingJobs = yield (0, cronjobTrackingService_1.findPendingJobs)('RECALCULATE_ALL_OWNER_SUMMARIES', 10);
        if (pendingJobs.length > 0) {
            console.warn(`Found ${pendingJobs.length} pending jobs. Resuming processing...`);
            return `resumed-${pendingJobs.map(j => j.id).join(',')}`;
        }
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
            return recentCompletedJob.id;
        }
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
        return mainJob.id;
    });
}
function handlePastYear(ownerId, year) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let month = 1; month <= 12; month++) {
            const periodKey = `${year}-${String(month).padStart(2, '0')}`;
            yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'MONTH', periodKey, year, month);
        }
        yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'YEAR', `${year}`, year, null);
    });
}
function handleCurrentYear(ownerId, year, now) {
    return __awaiter(this, void 0, void 0, function* () {
        const currentMonth = now.getMonth(); // 0-indexed (Jan = 0)
        const missingMonths = [];
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
        }
        else {
            const validMissingMonths = yield filterMonthsWithReservations(ownerId, year, missingMonths);
            if (validMissingMonths.length === 0) {
            }
            else {
                for (const month of validMissingMonths) {
                    const periodKey = `${year}-${String(month).padStart(2, '0')}`;
                    yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'MONTH', periodKey, year, month);
                }
            }
        }
        yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(ownerId, 'YEAR', `${year}`, year, null);
    });
}
function filterMonthsWithReservations(ownerId, year, months) {
    return __awaiter(this, void 0, void 0, function* () {
        const properties = yield prisma_1.default.property.findMany({
            where: { OwnerId: ownerId },
            select: { id: true }
        });
        const propertyIds = properties.map(p => p.id);
        if (propertyIds.length === 0) {
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
            }
        }
        return validMonths;
    });
}
