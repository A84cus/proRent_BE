"use strict";
// src/controllers/cron/prewarmController.ts
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
exports.prewarmReportsController = void 0;
const cronjobDashboardService_1 = require("../../service/report/cronJob/cronjobDashboardService");
const config_1 = require("../../config");
// Use environment variable for API key
const API_KEY = config_1.THIRD_PARTY_CONFIG.CRON_API_KEY;
if (!API_KEY) {
    console.warn('CRON_API_KEY is not set. Securing pre-warm endpoint is recommended.');
}
const prewarmReportsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // --- 🔐 Authentication ---
        const apiKey = req.query.apiKey;
        if (API_KEY && apiKey !== API_KEY) {
            res.status(401).json({ error: 'Unauthorized: Invalid API key' });
            return;
        }
        // --- 🗓️ Determine last month ---
        const now = new Date();
        let year, month;
        if (now.getMonth() === 0) {
            // January → use last year, December
            year = now.getFullYear() - 1;
            month = 12;
        }
        else {
            year = now.getFullYear();
            month = now.getMonth(); // 0-indexed → Jan=0, so we use `getMonth()` directly
        }
        const periodType = 'MONTH';
        const periodKey = `${year}-${String(month).padStart(2, '0')}`;
        // --- 🚀 Trigger pre-warm ---
        const jobId = yield (0, cronjobDashboardService_1.prewarmDashboardReports)(periodType, periodKey, year, month, 5, 1000);
        // --- ✅ Success ---
        res.status(200).json({
            success: true,
            message: `Prewarm job started for ${periodType} ${periodKey}`,
            jobId,
            target: { periodType, periodKey, year, month }
        });
    }
    catch (error) {
        console.error('[CRON] Prewarm failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});
exports.prewarmReportsController = prewarmReportsController;
