// src/services/report/dashboard/utils/buildPeriodConfig.ts

import { getYearPeriodKey, getMonthPeriodKey } from './periodKeyUtils';
import { getCustomPeriodKey } from '../reportUtils';
import { PeriodConfig } from '../../../interfaces/report/reportCustomInterface';

export function buildPeriodConfig (startDate: Date | null, endDate: Date | null): PeriodConfig {
   let periodType: 'YEAR' | 'MONTH' | 'CUSTOM' = 'YEAR';
   let periodKey = `${new Date().getFullYear()}`;
   let year = new Date().getFullYear();
   let month: number | null = null;

   if (startDate || endDate) {
      const yearKey = getYearPeriodKey(startDate, endDate);
      if (yearKey) {
         periodType = 'YEAR';
         periodKey = yearKey;
         year = parseInt(yearKey);
         month = null;
      } else {
         const monthKey = getMonthPeriodKey(startDate, endDate);
         if (monthKey) {
            periodType = 'MONTH';
            periodKey = monthKey;
            year = parseInt(monthKey.split('-')[0]);
            month = parseInt(monthKey.split('-')[1]);
         } else {
            periodType = 'CUSTOM';
            periodKey = getCustomPeriodKey(startDate!, endDate!);
            year = startDate!.getFullYear();
            month = null;
         }
      }
   }

   return { periodType, periodKey, year, month };
}
