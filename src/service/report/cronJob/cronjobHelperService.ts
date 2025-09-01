// src/service/report/cronJob/cronjobHelperService.ts
import { FinalizedPeriodParams } from '../../../interfaces/report/reportDashboardInterface';
import {
   handleMissingPeriodTypeAndKey,
   isPeriodTypeValid,
   isYearValid,
   isMonthValid,
   isPeriodKeyValid,
   buildDayPeriod,
   buildMonthPeriod,
   buildYearPeriod,
   deriveYearFromDate,
   deriveYearFromPeriodKey,
   deriveMonthFromPeriodKey,
   deriveMonthFromDate
} from './cronjobValidationService';

export function getDefaultPeriodParams (
   periodType: string | undefined,
   periodKey: string | undefined,
   year: number | undefined,
   month: number | null | undefined
): { periodType: string; periodKey: string; year: number; month: number | null } {
   const now = new Date();
   const finalPeriodType = periodType;
   const finalPeriodKey = periodKey;
   const finalYear = year;
   const finalMonth = month;

   return processPeriodParams(finalPeriodType, finalPeriodKey, finalYear, finalMonth, now);
}

function processPeriodParams (
   periodType: string | undefined,
   periodKey: string | undefined,
   year: number | undefined,
   month: number | null | undefined,
   now: Date
): { periodType: string; periodKey: string; year: number; month: number | null } {
   if (shouldHandleMissingParams(periodType, periodKey)) {
      const result = handleMissingPeriodTypeAndKey(year, month, now);
      return finalizeParams(result.periodType, result.periodKey, result.year, result.month);
   }

   return finalizeParams(periodType!, periodKey!, year!, month!);
}

function shouldHandleMissingParams (periodType: string | undefined, periodKey: string | undefined): boolean {
   return (periodType === undefined || periodType === null) && (periodKey === undefined || periodKey === null);
}

function finalizeParams (
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null
): { periodType: string; periodKey: string; year: number; month: number | null } {
   const finalPeriodType = validateAndDefaultPeriodType(periodType);
   const finalPeriodKey = validateAndDefaultPeriodKey(finalPeriodType, periodKey, year, month);
   const finalYear = validateAndDefaultYear(finalPeriodKey, year);
   const finalMonth = validateAndDefaultMonth(finalPeriodType, finalPeriodKey, month);

   return validateFinalParams(finalPeriodType, finalPeriodKey, finalYear, finalMonth);
}

function validateAndDefaultPeriodType (periodType: string): string {
   if (!isPeriodTypeValid(periodType)) {
      const defaultType = 'YEAR';
      console.warn(`Invalid or missing final periodType '${periodType}'. Forcing default: ${defaultType}`);
      return defaultType;
   }
   return periodType;
}

function validateAndDefaultPeriodKey (
   periodType: string,
   periodKey: string | undefined,
   year: number | undefined,
   month: number | null | undefined
): string {
   if (isPeriodKeyValid(periodKey)) {
      return periodKey!;
   }

   console.warn(`Invalid or missing final periodKey '${periodKey}'. Attempting to derive or default.`);
   return derivePeriodKey(periodType, year, month);
}

function derivePeriodKey (periodType: string, year: number | undefined, month: number | null | undefined): string {
   const now = new Date();

   if (periodType === 'DAY') {
      return buildDayPeriod(now).periodKey;
   } else if (periodType === 'MONTH' && isYearValid(year) && isMonthValid(month)) {
      return buildMonthPeriod(year!, month!).periodKey;
   } else if (periodType === 'YEAR' && isYearValid(year)) {
      return buildYearPeriod(year!).periodKey;
   } else {
      return handlePeriodKeyFallback(now, year, periodType);
   }
}

function handlePeriodKeyFallback (now: Date, year: number | undefined, periodType: string): string {
   const fallbackYear = year ?? deriveYearFromDate(now);
   console.warn(`Could not derive periodKey. Forcing to year: ${fallbackYear}`);

   if (periodType !== 'YEAR') {
      console.warn(`Forced periodKey derivation implies YEAR type.`);
   }

   return `${fallbackYear}`;
}

function validateAndDefaultYear (periodKey: string, year: number | undefined): number {
   if (isYearValid(year)) {
      return year!;
   }

   const derivedYear = deriveYearFromPeriodKey(periodKey);
   if (derivedYear !== undefined && !isNaN(derivedYear)) {
      return derivedYear;
   }

   const currentYear = deriveYearFromDate(new Date());
   console.warn(`Final year is still invalid/missing. Forcing to current year: ${currentYear}`);
   return currentYear;
}

function validateAndDefaultMonth (
   periodType: string,
   periodKey: string,
   month: number | null | undefined
): number | null {
   if (periodType === 'YEAR') {
      return null;
   } else if (periodType === 'MONTH') {
      return handleMonthForPeriodType('MONTH', periodKey, month);
   } else if (periodType === 'DAY') {
      return handleMonthForPeriodType('DAY', periodKey, month);
   }
   return month || null;
}

function handleMonthForPeriodType (type: string, periodKey: string, month: number | null | undefined): number | null {
   if (isMonthValid(month)) {
      return month || null;
   }

   const derivedMonth = deriveMonthFromPeriodKey(periodKey);
   if (derivedMonth !== null) {
      return derivedMonth;
   }
   const currentMonth = deriveMonthFromDate(new Date());
   console.warn(`Could not derive valid finalMonth for ${type} type. Defaulting to current month: ${currentMonth}`);
   return currentMonth;
}

function validateFinalParams (
   periodType: string,
   periodKey: string,
   year: number,
   month: number | null
): { periodType: string; periodKey: string; year: number; month: number | null } {
   if (!periodType || !periodKey || isNaN(year)) {
      const now = new Date();
      const criticalDefaultYear = now.getFullYear();
      console.error('Critical failure in deriving period parameters. Forcing ultimate defaults.');
      return {
         periodType: 'YEAR',
         periodKey: `${criticalDefaultYear}`,
         year: criticalDefaultYear,
         month: null
      };
   }

   return {
      periodType,
      periodKey,
      year,
      month: month || null
   };
}

export function validateFinalPeriodParams (params: FinalizedPeriodParams): void {
   const { periodType, periodKey, year } = params;

   if (!periodType || ![ 'DAY', 'MONTH', 'YEAR' ].includes(periodType)) {
      throw new Error(`Invalid final periodType after defaulting: ${periodType}. Must be DAY, MONTH, or YEAR.`);
   }

   if (!periodKey || typeof periodKey !== 'string') {
      throw new Error(`Invalid or missing final periodKey after defaulting: ${periodKey}. Must be a string.`);
   }

   if (year === undefined || isNaN(year)) {
      throw new Error(`Invalid or missing final year after defaulting: ${year}. Must be a number.`);
   }
}
