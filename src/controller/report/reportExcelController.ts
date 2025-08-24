// src/controllers/report/excelController.ts

import { Request, Response } from 'express';
import { dashboardReportController } from './reportCustomController'; // Reuse it!
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { getUserIdFromRequest } from '../reservationController';
import { generateDashboardExcel } from '../../templates/report/excelReport';

export const exportDashboardExcel = async (req: Request, res: Response): Promise<void> => {
   try {
      const ownerId = getUserIdFromRequest(req);
      if (!ownerId) {
         res.status(401).send('Unauthorized');
         return;
      }

      // --- 🎯 Reuse dashboard controller logic ---
      // We'll capture the report instead of sending it
      const mockRes: any = {
         status: () => mockRes,
         json: (data: ReportInterface.DashboardReportResponse) => {
            // ✅ Intercept the report
            return sendExcel(res, data, { ownerId, filters: req.query });
         },
         send: () => {}
      };

      // Call the same logic
      await dashboardReportController(req, mockRes);
   } catch (error: any) {
      console.error('Excel export failed:', error);
      res.status(500).send('Failed to generate Excel report');
   }
};

// --- Helper: Generate and send Excel ---
async function sendExcel (
   res: Response,
   report: ReportInterface.DashboardReportResponse,
   filters: { ownerId: string; filters: any }
) {
   try {
      const buffer = await generateDashboardExcel(report, { ownerId: filters.ownerId, ...filters.filters });

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `dashboard-report-${dateStr}.xlsx`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
   } catch (err: any) {
      console.error('Failed to generate Excel:', err);
      res.status(500).send('Failed to generate Excel');
   }
}
