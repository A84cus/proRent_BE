// src/services/report/dashboard/getOwnerDashboardReport.ts

import { DashboardInputSchema } from '../../validations/report/dashboardSchema';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { caseNoParam, caseRoomType, caseProperty, Fallback } from './cases';
import { validatePropertyOwnership, validateRoomTypeOwnership } from './cronJob/cronjobValidationService';
import { buildPeriodConfig } from './utils/buildPeriodConfig';

export function getPeriodConfig (startDate?: Date, endDate?: Date) {
   if (!startDate || !endDate) {
      const now = new Date();
      return {
         periodType: 'YEARLY' as const,
         periodKey: now.getFullYear().toString(),
         year: now.getFullYear(),
         month: null
      };
   }
   const year = startDate.getFullYear();
   return {
      periodType: 'YEARLY' as const,
      periodKey: year.toString(),
      year,
      month: null
   };
}

export async function getOwnerDashboardReport (
   ownerId: string,
   filters: Omit<ReportInterface.ReservationReportFilters, 'ownerId'>,
   options: ReportInterface.ReservationReportOptions = {},
   period?: { startDate?: Date | null; endDate?: Date | null }
): Promise<ReportInterface.DashboardReportResponse> {
   const result = DashboardInputSchema.safeParse({
      ownerId,
      filters,
      options,
      period: {
         startDate: filters.startDate || null,
         endDate: filters.endDate || null
      },
      periodConfig: getPeriodConfig(filters.startDate || undefined, filters.endDate || undefined)
   });

   if (result.success) {
      const { ownerId: validatedOwnerId, filters: validatedFilters, options: validatedOptions } = result.data;
      const { propertyId, roomTypeId } = validatedFilters;

      if (propertyId) {
         await validatePropertyOwnership(validatedOwnerId, propertyId);
      }
      if (roomTypeId && propertyId) {
         await validateRoomTypeOwnership(validatedOwnerId, roomTypeId);
      }

      const period = {
         startDate: validatedFilters.startDate ?? null,
         endDate: validatedFilters.endDate ?? null
      };

      const periodConfig = buildPeriodConfig(period.startDate, period.endDate);

      const context: ReportInterface.DashboardContext = {
         ownerId: validatedOwnerId,
         filters: validatedFilters as ReportInterface.ReservationReportFilters,
         options: validatedOptions,
         period,
         periodConfig
      };

      if (!propertyId) {
         return await caseNoParam.handleCase1(context);
      }
      if (propertyId && !roomTypeId) {
         return await caseProperty.handleCase2(context);
      }
      if (propertyId && roomTypeId) {
         return await caseRoomType.handleCase3(context);
      }

      return Fallback.fallbackResponse();
   }

   throw new Error(
      result.error.issues
         .map(err => {
            const path = err.path.length > 0 ? err.path.join('.') : 'input';
            return `${path}: ${err.message}`;
         })
         .join('; ')
   );
}
