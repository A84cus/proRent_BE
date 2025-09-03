// src/services/report/dashboard/getOwnerDashboardReport.ts

import { DashboardInputSchema } from '../../validations/report/dashboardSchema';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { validatePropertyOwnership, validateRoomTypeOwnership } from './cronJob/cronjobValidationService';
import { buildPeriodConfig } from './utils/buildPeriodConfig';
import { handleUnifiedReport } from './unifiedReport'; // ✅ New unified handler

/**
 * Legacy fallback (optional) – can be removed after migration
 */
const Fallback = {
   fallbackResponse (): ReportInterface.DashboardReportResponse {
      return {
         properties: [],
         summary: {
            Global: {
               totalActiveBookings: 0,
               totalActualRevenue: 0,
               totalProperties: 0,
               totalProjectedRevenue: 0
            },
            Aggregate: {
               counts: { DRAFT: 0, PENDING_PAYMENT: 0, PENDING_CONFIRMATION: 0, CONFIRMED: 0, CANCELLED: 0 },
               revenue: { actual: 0, projected: 0, average: 0 }
            },
            period: { startDate: null, endDate: null },
            pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 }
         }
      };
   }
};

export function getPeriodConfig (startDate?: Date, endDate?: Date) {
   return buildPeriodConfig(startDate || null, endDate || null);
}

/**
 * Main entry point for owner dashboard report
 */
export async function getOwnerDashboardReport (
   ownerId: string,
   filters: Omit<ReportInterface.ReportFilters, 'ownerId'>,
   options: ReportInterface.ReportOptions = {},
   period?: { startDate?: Date | null; endDate?: Date | null }
): Promise<ReportInterface.DashboardReportResponse> {
   // 🔹 Normalize period
   const effectivePeriod = {
      startDate: filters.startDate ?? period?.startDate ?? null,
      endDate: filters.endDate ?? period?.endDate ?? null
   };

   // 🔹 Validate input
   const result = DashboardInputSchema.safeParse({
      ownerId,
      filters,
      options,
      period: effectivePeriod,
      periodConfig: buildPeriodConfig(effectivePeriod.startDate, effectivePeriod.endDate)
   });

   if (!result.success) {
      throw new Error(
         result.error.issues
            .map(err => {
               const path = err.path.length > 0 ? err.path.join('.') : 'input';
               return `${path}: ${err.message}`;
            })
            .join('; ')
      );
   }

   const { ownerId: validatedOwnerId, filters: validatedFilters, options: validatedOptions } = result.data;

   // 🔐 Ownership validation
   if (validatedFilters.propertyId) {
      await validatePropertyOwnership(validatedOwnerId, validatedFilters.propertyId);
   }
   if (validatedFilters.roomTypeId && validatedFilters.propertyId) {
      await validateRoomTypeOwnership(validatedOwnerId, validatedFilters.roomTypeId);
   }

   // 📅 Build period & context
   const periodConfig = buildPeriodConfig(effectivePeriod.startDate, effectivePeriod.endDate);

   const context: ReportInterface.DashboardContext = {
      ownerId: validatedOwnerId,
      filters: validatedFilters,
      options: validatedOptions,
      period: effectivePeriod,
      periodConfig
   };

   try {
      // ✅ Use unified report for all cases
      return await handleUnifiedReport(context);
   } catch (error) {
      console.error('Error in handleUnifiedReport:', error);
      return Fallback.fallbackResponse();
   }
}
