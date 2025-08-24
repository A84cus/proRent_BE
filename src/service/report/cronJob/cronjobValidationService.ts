// src/services/report/cronjobValidationService.ts
import prisma from '../../../prisma';

export async function validatePropertyOwnership (ownerId: string, propertyId: string): Promise<void> {
   const propertyCheck = await prisma.property.findUnique({
      where: { id: propertyId, OwnerId: ownerId },
      select: { id: true }
   });

   if (!propertyCheck) {
      throw new Error(`Property with ID ${propertyId} not found or does not belong to owner ${ownerId}.`);
   }
}

export async function validateRoomTypeOwnership (ownerId: string, roomTypeId: string): Promise<void> {
   const roomTypeCheck = await prisma.roomType.findUnique({
      where: {
         id: roomTypeId,
         property: {
            OwnerId: ownerId // Validate via property ownership relation
         }
      },
      select: { id: true }
   });
   if (!roomTypeCheck) {
      throw new Error(`RoomType with ID ${roomTypeId} not found or does not belong to an owner property ${ownerId}.`);
   }
}

export function isPeriodTypeValid (periodType: string | undefined | null): boolean {
   return !!periodType && [ 'DAY', 'MONTH', 'YEAR' ].includes(periodType);
}

export function isPeriodKeyValid (periodKey: string | undefined | null): boolean {
   return !!periodKey && typeof periodKey === 'string';
}

export function isYearValid (year: number | undefined | null): boolean {
   return year !== undefined && year !== null && !isNaN(year);
}

export function isMonthValid (month: number | null | undefined): boolean {
   return month !== undefined && month !== null && !isNaN(month) && month >= 1 && month <= 12;
}

export function deriveYearFromDate (date: Date): number {
   return date.getFullYear();
}

export function deriveMonthFromDate (date: Date): number {
   return date.getMonth() + 1;
}

export function deriveYesterdayKey (now: Date): string {
   const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
   return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(
      yesterday.getDate()
   ).padStart(2, '0')}`;
}

export function deriveYearFromPeriodKey (periodKey: string): number | undefined {
   if (/^\d{4}$/.test(periodKey)) {
      return Number(periodKey);
   }

   const parts = periodKey.split('-');
   if (parts.length >= 1 && /^\d{4}$/.test(parts[0])) {
      return Number(parts[0]);
   }

   return undefined;
}

export function deriveMonthFromPeriodKey (periodKey: string): number | null {
   const parts = periodKey.split('-');
   if (parts.length >= 2) {
      const monthPart = Number(parts[1]);
      if (!isNaN(monthPart) && monthPart >= 1 && monthPart <= 12) {
         return monthPart;
      }
   }
   return null;
}

export function buildYearPeriod (year: number): { periodType: string; periodKey: string; month: null } {
   console.log(`Deriving period: YEAR ${year} (from provided year only)`);
   return {
      periodType: 'YEAR',
      periodKey: `${year}`,
      month: null
   };
}

export function buildMonthPeriod (
   year: number,
   month: number
): { periodType: string; periodKey: string; month: number } {
   console.log(`Deriving period: MONTH ${year}-${String(month).padStart(2, '0')} (from provided year and month)`);
   return {
      periodType: 'MONTH',
      periodKey: `${year}-${String(month).padStart(2, '0')}`,
      month
   };
}

export function buildDayPeriod (now: Date): { periodType: string; periodKey: string; year: number; month: number } {
   const yesterdayKey = deriveYesterdayKey(now);
   const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
   console.log(`Defaulted missing DAY periodKey to yesterday: ${yesterdayKey}`);

   return {
      periodType: 'DAY',
      periodKey: yesterdayKey,
      year: yesterday.getFullYear(),
      month: yesterday.getMonth() + 1
   };
}

export function handleMissingPeriodTypeAndKey (
   year: number | undefined | null,
   month: number | null | undefined,
   now: Date
): { periodType: string; periodKey: string; year: number; month: number | null } {
   // --- CHANGE DEFAULT LOGIC HERE ---
   console.log("Period type and/or period key not specified for cron job, defaulting to 'YEAR' and current year.");

   if (isYearValid(year)) {
      // If year is valid, default to YEAR type for that specific year
      console.log(`Valid year ${year} provided, defaulting to YEAR ${year}.`);
      return handleValidYear(year!, month);
   } else {
      // If no valid year, default to the CURRENT YEAR
      console.log('No valid year provided, defaulting to CURRENT YEAR.');
      const currentYear = deriveYearFromDate(now);
      // --- DEFAULT TO 'YEAR' TYPE ---
      return {
         ...buildYearPeriod(currentYear), // Sets periodType: 'YEAR', periodKey: 'YYYY', month: null
         year: currentYear
      };
   }
}

function handleValidYear (
   year: number,
   month: number | null | undefined
): { periodType: string; periodKey: string; year: number; month: number | null } {
   if (month === undefined || month === null) {
      return { ...buildYearPeriod(year), year };
   } else if (isMonthValid(month)) {
      return { ...buildMonthPeriod(year, month!), year, month: month! };
   } else {
      return handleInvalidMonth(year);
   }
}

function handleInvalidMonth (year: number): { periodType: string; periodKey: string; year: number; month: null } {
   console.warn(`Provided year ${year} but invalid month. Defaulting to YEAR ${year}.`);
   return { ...buildYearPeriod(year), year };
}

function handleMissingYear (now: Date): { periodType: string; periodKey: string; year: number; month: null } {
   console.log(
      "Neither valid 'year' nor valid 'periodType/periodKey' provided. Defaulting to 'YEAR' for current year."
   );
   const currentYear = deriveYearFromDate(now);
   return { ...buildYearPeriod(currentYear), year: currentYear };
}
