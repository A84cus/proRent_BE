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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduledJobs = startScheduledJobs;
// src/jobs/scheduledJobs.ts
const cronjobDashboardService_1 = require("../../service/report/cronJob/cronjobDashboardService");
function startScheduledJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Pre-warm last month
            const now = new Date();
            const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            const month = now.getMonth() === 0 ? 12 : now.getMonth();
            yield (0, cronjobDashboardService_1.prewarmDashboardReports)('MONTH', `${year}-${String(month).padStart(2, '0')}`, year, month, 5, 1000);
        }
        catch (error) {
            console.error('Prewarm job failed:', error);
        }
    });
}
