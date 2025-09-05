// src/services/report/dashboard/utils/periodKeyUtils.ts

export function getMonthPeriodKey (startDate: Date | null, endDate: Date | null): string | null {
   if (!startDate || !endDate) {return null;}

   const start = new Date(startDate);
   const end = new Date(endDate);

   const startDay = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
   const endDay = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

   const nextMonth = new Date(Date.UTC(start.getFullYear(), start.getMonth() + 1, 1));
   const lastDayOfMonth = new Date(nextMonth.getTime() - 1);

   const isStartOfMonth = startDay.getUTCDate() === 1;
   const isEndOfMonth =
      endDay.getUTCFullYear() === lastDayOfMonth.getUTCFullYear() &&
      endDay.getUTCMonth() === lastDayOfMonth.getUTCMonth() &&
      endDay.getUTCDate() === lastDayOfMonth.getUTCDate();

   if (isStartOfMonth && isEndOfMonth) {
      return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
   }

   return null;
}

export function getYearPeriodKey (startDate: Date | null, endDate: Date | null): string | null {
   if (!startDate || !endDate) {return null;}

   const start = new Date(startDate);
   const end = new Date(endDate);

   const startDay = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));
   const endDay = new Date(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()));

   const year = start.getFullYear();
   const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
   const lastDayOfYear = new Date(Date.UTC(year, 11, 31));

   const isStartOfYear = startDay.getTime() === firstDayOfYear.getTime();
   const isEndOfYear = endDay.getTime() === lastDayOfYear.getTime();

   if (isStartOfYear && isEndOfYear) {
      return `${year}`;
   }

   return null;
}
