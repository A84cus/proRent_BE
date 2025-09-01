// src/controllers/report/dashboardReportController.ts

import { Request, Response } from 'express';
import { getOwnerDashboardReport } from '../../service/report/reportDashboardService';
import { getUserIdFromRequest } from '../reservationController/paymentProofController';
import { DashboardInputSchema } from '../../validations/report/dashboardSchema';
import { z } from 'zod';

// 👇 Extract types from schema
type DashboardFilters = z.infer<typeof DashboardInputSchema.shape.filters>;
type DashboardOptions = z.infer<typeof DashboardInputSchema.shape.options>;

function parseDate (value: unknown): Date | undefined {
   if (typeof value !== 'string') {
      return undefined;
   }
   const date = new Date(value);
   return isNaN(date.getTime()) ? undefined : date;
}

// Helper: Parse reservationPage safely
function parseReservationPage (value: unknown): number | { [roomTypeId: string]: number } {
   if (value === undefined || value === null || value === '') {
      return 1;
   }

   // Case 1: Already a number string
   if (typeof value === 'string') {
      const num = Number(value);
      if (!isNaN(num) && Number.isInteger(num) && num >= 1) {
         return num;
      }

      // Try JSON parse
      try {
         const parsed = JSON.parse(value);
         if (typeof parsed === 'number' && Number.isInteger(parsed) && parsed >= 1) {
            return parsed;
         }
         if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            for (const key in parsed) {
               const v = parsed[key];
               if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) {
                  console.warn('Invalid page value in reservationPage:', { key, value: v });
                  return 1;
               }
            }
            return parsed as { [roomTypeId: string]: number };
         }
      } catch (e) {
         console.warn('Failed to parse reservationPage JSON:', value);
         return 1;
      }
   }

   // Case 2: Already a number
   if (typeof value === 'number' && Number.isInteger(value) && value >= 1) {
      return value;
   }

   return 1;
}

// Helper: Parse reservationPageSize
function parseReservationPageSize (value: unknown): number {
   const num = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
   if (isNaN(num) || !Number.isInteger(num) || num < 1) {
      return 10;
   }
   return Math.min(num, 100);
}

export const dashboardReportController = async (req: Request, res: Response): Promise<void> => {
   try {
      // --- 1. Extract ownerId ---
      const ownerId = getUserIdFromRequest(req);
      if (!ownerId) {
         res.status(401).json({ error: 'Unauthorized' });
         return;
      }
      console.log('Raw query startDate:', req.query.startDate);
      console.log('Parsed startDate:', parseDate(req.query.startDate));
      // --- 2. Parse query params safely ---
      const {
         propertyId,
         roomTypeId,
         startDate,
         endDate,
         status,
         search,
         page,
         pageSize,
         sortBy,
         sortDir,
         reservationPageSize: rawReservationPageSize,
         reservationPage: rawReservationPage
      } = req.query;

      const isValidStatus = (
         s: string
      ): s is 'PENDING_PAYMENT' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'CANCELLED' => {
         return [ 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED' ].includes(s);
      };

      const filters: DashboardFilters = {
         propertyId: typeof propertyId === 'string' ? propertyId : undefined,
         roomTypeId: typeof roomTypeId === 'string' ? roomTypeId : undefined,
         startDate: parseDate(startDate),
         endDate: parseDate(endDate),
         status: Array.isArray(status)
            ? status.filter((s): s is string => typeof s === 'string').filter(isValidStatus)
            : typeof status === 'string' && isValidStatus(status)
            ? [ status ]
            : [],
         search: typeof search === 'string' ? search : undefined
      };

      // 👇 Parse options
      const options: DashboardOptions = {
         page: typeof page === 'string' ? Math.max(1, parseInt(page, 10)) : 1,
         pageSize: typeof pageSize === 'string' ? Math.max(1, Math.min(100, parseInt(pageSize, 10))) : 20,
         sortBy: [ 'startDate', 'endDate', 'createdAt', 'paymentAmount' ].includes(sortBy as string)
            ? (sortBy as 'startDate' | 'endDate' | 'createdAt' | 'paymentAmount')
            : 'startDate',
         sortDir: sortDir === 'asc' ? 'asc' : 'desc',
         reservationPage: parseReservationPage(rawReservationPage),
         reservationPageSize: parseReservationPageSize(rawReservationPageSize)
      };

      // 👇 Validate full input with Zod (this ensures type safety)
      const validatedInput = DashboardInputSchema.safeParse({
         ownerId,
         filters,
         options
      });

      if (!validatedInput.success) {
         console.warn('Validation failed:', validatedInput.error.flatten());
         res.status(400).json({
            error: 'Invalid request parameters',
            details: validatedInput.error.flatten()
         });
         return;
      }

      const { ownerId: validatedOwnerId, filters: validatedFilters, options: validatedOptions } = validatedInput.data;

      // --- 3. Call service ---
      const period = {
         startDate: validatedFilters.startDate || null,
         endDate: validatedFilters.endDate || null
      };

      const report = await getOwnerDashboardReport(validatedOwnerId, validatedFilters, validatedOptions, period);

      res.status(200).json(report);
   } catch (error: any) {
      console.error('Error in dashboardReportController:', error);

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

      res.status(500).json({
         error: 'Failed to generate dashboard report',
         details: error.message
      });
   }
};
