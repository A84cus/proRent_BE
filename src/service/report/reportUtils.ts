export function getCustomPeriodKey (startDate: Date, endDate: Date): string {
   if (!isValidDate(startDate)) {
      throw new Error(`Invalid start date: ${startDate}`);
   }
   if (!isValidDate(endDate)) {
      throw new Error(`Invalid end date: ${endDate}`);
   }

   const startStr = formatDate(startDate);
   const endStr = formatDate(endDate);
   return `custom:${startStr}_to_${endStr}`;
}

function formatDate (date: Date): string {
   const d = new Date(date);
   const year = d.getFullYear();
   const month = String(d.getMonth() + 1).padStart(2, '0');
   const day = String(d.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
}

function isValidDate (d: any): d is Date {
   return d instanceof Date && !isNaN(d.getTime());
}
