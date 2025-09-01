// src/controllers/report/excelController.ts

import { Request, Response } from 'express';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { getUserIdFromRequest } from '../reservationController/paymentProofController';
import { generateDashboardExcel } from '../../templates/report/excelReport';
import { buildContextFromRequest } from '../../service/report/buildContextByRequest';

export const exportDashboardExcel = async (req: Request, res: Response): Promise<void> => {
   try {
      const ownerId = getUserIdFromRequest(req);
      if (!ownerId) {
         res.status(401).send('Unauthorized');
         return;
      }

      // ✅ 1. Build context from request
      const context = buildContextFromRequest(req, ownerId);

      // ✅ 2. Get export format: FULL | PROPERTY | ROOM_TYPE
      const format = (req.query.format as string)?.toUpperCase();
      if (![ 'FULL', 'PROPERTY', 'ROOM_TYPE' ].includes(format)) {
         res.status(400).send('Invalid format. Use: FULL, PROPERTY, ROOM_TYPE');
         return;
      }

      // ✅ 3. Generate Excel buffer
      const buffer = await generateDashboardExcel(context, format as 'FULL' | 'PROPERTY' | 'ROOM_TYPE');

      // ✅ 4. Send file
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `dashboard-report-${format.toLowerCase()}-${dateStr}.xlsx`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
   } catch (error: any) {
      console.error('Excel export failed:', error);
      res.status(500).send('Failed to generate Excel report');
   }
};
