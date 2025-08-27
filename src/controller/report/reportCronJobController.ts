// src/controllers/cron/prewarmController.ts

import { Request, Response } from 'express';
import { prewarmDashboardReports } from '../../service/report/cronJob/cronjobDashboardService';
import { THIRD_PARTY_CONFIG } from '../../config';

// Use environment variable for API key
const API_KEY = THIRD_PARTY_CONFIG.CRON_API_KEY;

if (!API_KEY) {
   console.warn('CRON_API_KEY is not set. Securing pre-warm endpoint is recommended.');
}

export const prewarmReportsController = async (req: Request, res: Response): Promise<void> => {
   try {
      // --- 🔐 Authentication ---
      const apiKey = req.query.apiKey as string;
      if (API_KEY && apiKey !== API_KEY) {
         res.status(401).json({ error: 'Unauthorized: Invalid API key' });
         return;
      }

      // --- 🗓️ Determine last month ---
      const now = new Date();
      let year: number, month: number;

      if (now.getMonth() === 0) {
         // January → use last year, December
         year = now.getFullYear() - 1;
         month = 12;
      } else {
         year = now.getFullYear();
         month = now.getMonth(); // 0-indexed → Jan=0, so we use `getMonth()` directly
      }

      const periodType = 'MONTH';
      const periodKey = `${year}-${String(month).padStart(2, '0')}`;

      // --- 🚀 Trigger pre-warm ---
      const jobId = await prewarmDashboardReports(periodType, periodKey, year, month, 5, 1000);

      // --- ✅ Success ---
      res.status(200).json({
         success: true,
         message: `Prewarm job started for ${periodType} ${periodKey}`,
         jobId,
         target: { periodType, periodKey, year, month }
      });
   } catch (error: any) {
      console.error('[CRON] Prewarm failed:', error);
      res.status(500).json({
         success: false,
         error: error.message || 'Internal server error'
      });
   }
};
