// src/templates/report/excelReport.ts
import ExcelJS from 'exceljs';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';
import { handleUnifiedReport } from '../../service/report/unifiedReport';
import { addSummarySheet } from './summarySheet';
import { addFullOwnerSheets } from './ownerReport';
import { addPropertySheets } from './propertyReport';
import { addRoomTypeSheets } from './roomTypeReport';
import { addFiltersSheet, autoFitColumns } from './helper'; // Ensure autoFitColumns is imported

// const SHEET_NAME_MAX = 31; // Excel limit - already defined in helper

export async function generateDashboardExcel (
   context: ReportInterface.DashboardContext,
   format: 'FULL' | 'PROPERTY' | 'ROOM_TYPE'
): Promise<Buffer> {
   const excelContext: ReportInterface.DashboardContext = {
      ...context,
      options: {
         ...context.options,
         fetchAllData: true
      }
   };
   const report = await handleUnifiedReport(excelContext);
   const workbook = new ExcelJS.Workbook();

   // Add summary sheet (always)
   addSummarySheet(workbook, report, context, format);

   // Add data sheets based on format
   switch (format) {
      case 'FULL':
         addFullOwnerSheets(workbook, report);
         break;
      case 'PROPERTY':
         addPropertySheets(workbook, report, context.filters.propertyId!);
         break;
      case 'ROOM_TYPE':
         addRoomTypeSheets(workbook, report, context.filters.roomTypeId!);
         break;
   }

   // Add filters sheet
   addFiltersSheet(workbook, context.filters);

   // --- Auto-fit columns AFTER all sheets and data are added ---
   autoFitColumns(workbook);
   // --- End of Auto-fit ---

   const buffer = await workbook.xlsx.writeBuffer();
   return Buffer.from(buffer);
}
