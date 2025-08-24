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
exports.processOwnerBatch = processOwnerBatch;
exports.updateMainJobMetadata = updateMainJobMetadata;
exports.finalizeMainJob = finalizeMainJob;
exports.processOwnerRoomTypeBatch = processOwnerRoomTypeBatch;
// services/report/cronjobProcessService.ts
const cronjobTrackingService_1 = require("./cronjobTrackingService");
const prisma_1 = __importDefault(require("../../../prisma"));
const client_1 = require("@prisma/client");
const cronjobDetailProcessService_1 = require("./cronjobDetailProcessService");
function processOwnerBatch(ownersBatch_1, mainJobId_1, periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (ownersBatch, mainJobId, periodType, periodKey, // This IS a string (e.g., "2023-10", "2023")
    year, month = null, // This can be null
    failedOwnerIds, isCurrentYearCalculation, previousMonthKey) {
        console.log(`Processing batch of ${ownersBatch.length} owners for summaries (Job ID: ${mainJobId})`);
        console.log(`  Context: ${periodType} ${periodKey} (Year: ${year}, Month: ${month})`);
        console.log(`  Current Year Mode: ${isCurrentYearCalculation}, Previous Month Key: ${previousMonthKey}`);
        const ownerJobPromises = ownersBatch.map((owner) => __awaiter(this, void 0, void 0, function* () {
            // --- Create a sub-job for the specific owner's calculations ---
            const ownerJob = yield (0, cronjobTrackingService_1.createBatchJob)({
                jobType: 'RECALCULATE_OWNER_SUMMARIES', // Updated job type for combined work
                targetOwnerId: owner.id,
                targetPeriodType: periodType,
                targetPeriodKey: periodKey,
                metadata: { year, month, mainJobId, owner: owner.id, isCurrentYearCalculation, previousMonthKey } // Include owner ID in metadata
            });
            try {
                // --- Call the function that processes ONE owner ---
                // This function should internally handle both Property and RoomType calculations for this owner.
                yield (0, cronjobDetailProcessService_1.recalculateOwnerSummariesForPeriod)(owner.id, periodType, periodKey, year, month, isCurrentYearCalculation, previousMonthKey);
                yield (0, cronjobTrackingService_1.updateBatchJob)({ jobId: ownerJob.id, status: client_1.JobStatus.COMPLETED, completedAt: new Date() });
                console.log(`Successfully recalculated ALL summaries (Property & RoomType) for owner ${owner.id} (Sub-Job ID: ${ownerJob.id})`);
            }
            catch (err) {
                console.error(`Error recalculating ALL summaries for owner ${owner.id} (Sub-Job ID: ${ownerJob.id}):`, err);
                failedOwnerIds.push(owner.id);
                yield (0, cronjobTrackingService_1.updateBatchJob)({
                    jobId: ownerJob.id,
                    status: client_1.JobStatus.FAILED,
                    errorMessage: err.message,
                    completedAt: new Date()
                });
                // Don't re-throw here, let other owners in the batch continue
            }
        }));
        yield Promise.allSettled(ownerJobPromises);
    });
}
function updateMainJobMetadata(jobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const currentMainJob = yield prisma_1.default.batchJob.findUnique({ where: { id: jobId } });
        if (!currentMainJob) {
            console.warn(`Main job ${jobId} not found during progress update.`);
            return;
        }
        yield (0, cronjobTrackingService_1.updateBatchJob)({
            jobId,
            metadata: Object.assign(Object.assign({}, currentMainJob.metadata), { totalOwnersProcessed: totalProcessedOwners, totalBatchesCompleted, failedOwnerIds: [...(((_a = currentMainJob.metadata) === null || _a === void 0 ? void 0 : _a.failedOwnerIds) || []), ...failedOwnerIds] })
        });
    });
}
function finalizeMainJob(jobId_1, totalProcessedOwners_1, totalBatchesCompleted_1, failedOwnerIds_1) {
    return __awaiter(this, arguments, void 0, function* (jobId, totalProcessedOwners, totalBatchesCompleted, failedOwnerIds, errorMessage = null) {
        const finalStatus = failedOwnerIds.length > 0 ? client_1.JobStatus.FAILED : client_1.JobStatus.COMPLETED;
        const finalMainJob = yield prisma_1.default.batchJob.findUnique({ where: { id: jobId } });
        yield (0, cronjobTrackingService_1.updateBatchJob)({
            jobId,
            status: finalStatus,
            completedAt: new Date(),
            errorMessage,
            metadata: Object.assign(Object.assign({}, finalMainJob === null || finalMainJob === void 0 ? void 0 : finalMainJob.metadata), { totalOwnersProcessed: totalProcessedOwners, totalBatchesCompleted,
                failedOwnerIds })
        });
        console.log(`Global recalculation job ${jobId} completed. Status: ${finalStatus}, Processed: ${totalProcessedOwners}, Failed: ${failedOwnerIds.length}`);
    });
}
function processOwnerRoomTypeBatch(ownerId_1, periodType_1, periodKey_1, year_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, periodType, periodKey, year, month = null, failedOwnerIds // Reference to accumulate failed owner IDs from the main process
    ) {
        console.log(`Starting RoomType summary recalculation for owner ${ownerId} (Period: ${periodType}:${periodKey})`);
        try {
            // --- 1. Fetch all properties for the owner ---
            const properties = yield prisma_1.default.property.findMany({
                where: { OwnerId: ownerId },
                select: { id: true }
            });
            if (properties.length === 0) {
                console.log(`No properties found for owner ${ownerId} during RoomType recalculation. Skipping.`);
                return;
            }
            // --- 2. Fetch all RoomTypes for those properties ---
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
            if (roomTypes.length === 0) {
                console.log(`No room types found for owner ${ownerId}'s properties during RoomType recalculation. Skipping.`);
                return;
            }
            console.log(`Found ${roomTypes.length} room types for owner ${ownerId}. Starting calculations...`);
            // --- 3. Process Each RoomType ---
            const roomTypePromises = roomTypes.map(rt => (0, cronjobDetailProcessService_1.recalculateRoomTypeSummaryForPeriod)(ownerId, rt.id, periodType, periodKey, year, month)
                .then(() => ({ status: 'fulfilled', roomTypeId: rt.id }))
                .catch(err => {
                console.error(`Error recalculating RoomType summary ${rt.id} for owner ${ownerId}:`, err);
                return { status: 'rejected', roomTypeId: rt.id, reason: err };
            }));
            // --- 4. Wait for all calculations ---
            const results = yield Promise.allSettled(roomTypePromises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            // --- 5. Log Results ---
            // Note: We don't throw an error here to let the main process continue.
            // Failed owner tracking might need refinement based on whether *any* room type failing marks the owner as failed.
            console.log(`RoomType recalculation for owner ${ownerId} completed. Successful: ${successful}, Failed: ${failed}`);
            if (failed > 0) {
                // Optionally, decide if this constitutes an owner-level failure.
                // For now, we log it. You might push ownerId to failedOwnerIds here if desired.
                // failedOwnerIds.push(ownerId); // Uncomment if owner fails if any room type fails
                console.warn(`Owner ${ownerId} had ${failed} failed RoomType calculations.`);
            }
        }
        catch (error) {
            console.error(`Critical error during RoomType batch processing for owner ${ownerId}:`, error);
            // Marking the owner as failed due to a critical error in fetching room types or initiating calculations
            failedOwnerIds.push(ownerId);
            // Don't re-throw to keep the main batch processing loop alive
        }
    });
}
