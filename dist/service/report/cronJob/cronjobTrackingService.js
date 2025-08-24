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
exports.createBatchJob = createBatchJob;
exports.updateBatchJob = updateBatchJob;
exports.findPendingJobs = findPendingJobs;
exports.findBatchJobById = findBatchJobById;
exports.handleExistingJobs = handleExistingJobs;
exports.isJobRunningForPeriod = isJobRunningForPeriod;
// services/report/cronjobTrackingService.ts
const prisma_1 = __importDefault(require("../../../prisma")); // Adjust path
const client_1 = require("@prisma/client"); // Adjust import if needed
const client_2 = require("@prisma/client");
const cronJobMainService_1 = require("../cronJobMainService");
// --- Service Functions ---
function createBatchJob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        return yield prisma_1.default.batchJob.create({
            data: {
                jobType: data.jobType,
                targetOwnerId: (_a = data.targetOwnerId) !== null && _a !== void 0 ? _a : null,
                targetPeriodType: (_b = data.targetPeriodType) !== null && _b !== void 0 ? _b : null,
                targetPeriodKey: (_c = data.targetPeriodKey) !== null && _c !== void 0 ? _c : null,
                metadata: (_d = data.metadata) !== null && _d !== void 0 ? _d : client_2.Prisma.JsonNull
            }
        });
    });
}
function updateBatchJob(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { jobId } = data, updateFields = __rest(data, ["jobId"]);
        // --- Key Fix: Prepare data for Prisma, explicitly handling null/undefined for Json fields ---
        const prismaUpdateData = {};
        // Iterate through the fields and add them to prismaUpdateData only if they are not undefined
        // This avoids passing `undefined` which can cause typing issues with optional Json fields
        if (updateFields.status !== undefined) {
            prismaUpdateData.status = updateFields.status;
        }
        if (updateFields.startedAt !== undefined) {
            prismaUpdateData.startedAt = updateFields.startedAt;
        }
        if (updateFields.completedAt !== undefined) {
            prismaUpdateData.completedAt = updateFields.completedAt;
        }
        if (updateFields.errorMessage !== undefined) {
            prismaUpdateData.errorMessage = updateFields.errorMessage;
        }
        // Crucially, explicitly handle metadata being null or a value. undefined is skipped.
        if (updateFields.metadata !== undefined) {
            if (updateFields.metadata === null) {
                prismaUpdateData.metadata = client_2.Prisma.JsonNull;
            }
            else {
                prismaUpdateData.metadata = updateFields.metadata;
            }
        }
        return yield prisma_1.default.batchJob.update({
            where: { id: jobId },
            data: prismaUpdateData // Use the explicitly typed data object
        });
    });
}
function findPendingJobs(jobType_1) {
    return __awaiter(this, arguments, void 0, function* (jobType, limit = 10) {
        const whereClause = {
            status: client_1.JobStatus.PENDING
        };
        if (jobType) {
            whereClause.jobType = jobType;
        }
        return yield prisma_1.default.batchJob.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'asc' // Process oldest pending jobs first
            },
            take: limit
        });
    });
}
function findBatchJobById(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.batchJob.findUnique({
            where: { id: jobId }
        });
    });
}
function handleExistingJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        const pendingJobs = yield findPendingJobs('RECALCULATE_ALL_OWNER_SUMMARIES', 10);
        if (pendingJobs.length > 0) {
            console.log(`Found ${pendingJobs.length} pending jobs. Resuming...`);
            // Optionally: resume or re-queue them
            for (const job of pendingJobs) {
                console.log(`Re-initiating background processing for job ${job.id}`);
                if (typeof job.metadata === 'object' && job.metadata !== null) {
                    const metadata = job.metadata;
                    (0, cronJobMainService_1.initiateBackgroundProcessing)(job.id, {
                        periodType: job.targetPeriodType,
                        periodKey: job.targetPeriodKey,
                        year: metadata.year,
                        month: metadata.month
                    }, metadata.batchSize, metadata.delayMs, metadata.isCurrentYearCalculation, metadata.previousMonthKey);
                }
            }
            return true; // Indicate resumption, block new job
        }
        return false;
    });
}
function isJobRunningForPeriod(periodType, periodKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingJob = yield prisma_1.default.batchJob.findFirst({
            where: {
                jobType: 'RECALCULATE_ALL_OWNER_SUMMARIES',
                targetPeriodType: periodType,
                targetPeriodKey: periodKey,
                status: {
                    in: [client_1.JobStatus.PENDING, client_1.JobStatus.IN_PROGRESS]
                }
            }
        });
        return !!existingJob;
    });
}
