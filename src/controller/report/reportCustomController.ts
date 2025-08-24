// src/controllers/report/dashboardReportController.ts

import { Request, Response } from 'express';
import { getOwnerDashboardReport } from '../../service/report/reportDashboardService';
import { getUserIdFromRequest } from '../reservationController';

export const dashboardReportController = async (req: Request, res: Response): Promise<void> => {
   try {
      // --- 1. Extract ownerId ---
      const ownerId = getUserIdFromRequest(req);
      if (!ownerId) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }

      // --- 2. Pass raw query to service ---
      // Zod will handle parsing and validation
      const rawInput = {
         ownerId,
         filters: req.query,
         options: req.query
      };

      // --- 3. Call service ---
      const report = await getOwnerDashboardReport(rawInput.ownerId, rawInput.filters, rawInput.options);

      // --- 4. Send response ---
      res.status(200).json(report);
   } catch (error: any) {
      console.error('Error in dashboardReportController:', error);

      // --- Handle known error types ---
      if (error.message.includes('Invalid ID') || error.message.includes('Invalid element')) {
         res.status(400).json({
            error: 'Invalid request',
            details: error.message
         });
         return;
      }

      if (error.message.includes('not found or not owned') || error.message.includes('Access denied')) {
         res.status(403).json({ error: 'Access denied' });
         return;
      }

      // --- Unknown error ---
      res.status(500).json({
         error: 'Failed to generate dashboard report',
         details: error.message
      });
   }
};
