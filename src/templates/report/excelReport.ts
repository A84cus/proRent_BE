// src/services/report/excel/exportDashboardExcel.ts

import ExcelJS from 'exceljs';
import * as ReportInterface from '../../interfaces/report/reportCustomInterface';

/**
 * Generates an Excel buffer from a dashboard report
 */
export async function generateDashboardExcel (
   report: ReportInterface.DashboardReportResponse,
   filters: ReportInterface.ReservationReportFilters
): Promise<Buffer> {
   // ✅ Fix: Use Promise<Buffer>, not Buffer<ArrayBufferLike>
   const workbook = new ExcelJS.Workbook();

   // --- Sheet 1: Summary ---
   const summarySheet = workbook.addWorksheet('Summary');

   // Title
   summarySheet.mergeCells('A1', 'D1');
   summarySheet.getCell('A1').value = 'DASHBOARD REPORT';
   summarySheet.getCell('A1').font = { bold: true, size: 16 };
   summarySheet.getCell('A1').alignment = { horizontal: 'center' };

   // Period
   summarySheet.addRow([ 'Period', `${formatDate(report.period.startDate)} to ${formatDate(report.period.endDate)}` ]);
   summarySheet.addRow([ 'Generated On', new Date().toLocaleString() ]);
   summarySheet.addRow([]);

   // Summary Counts
   summarySheet.addRow([ 'Status', 'Total' ]);
   summarySheet.addRow([ 'CONFIRMED', report.summary.counts.CONFIRMED ]);
   summarySheet.addRow([ 'PENDING_PAYMENT', report.summary.counts.PENDING_PAYMENT ]);
   summarySheet.addRow([ 'PENDING_CONFIRMATION', report.summary.counts.PENDING_CONFIRMATION ]);
   summarySheet.addRow([ 'CANCELLED', report.summary.counts.CANCELLED ]);
   summarySheet.addRow([]);

   // Revenue
   summarySheet.addRow([ 'Revenue' ]);
   summarySheet.addRow([ 'Actual', report.summary.revenue.actual ]);
   summarySheet.addRow([ 'Projected', report.summary.revenue.projected ]);
   summarySheet.addRow([ 'Average', report.summary.revenue.average ]);

   // Format currency
   summarySheet.getColumn(2).numFmt = '"Rp"#,##0';

   // --- Sheet 2: Properties & Room Types ---
   const propertySheet = workbook.addWorksheet('Properties');
   propertySheet.addRow([ 'Property Name', 'Address', 'City', 'Type', 'Revenue (Rp)', 'Reservations' ]);
   propertySheet.getRow(1).font = { bold: true };

   report.properties.forEach(p => {
      propertySheet.addRow([
         p.property.name,
         p.property.address || '-',
         p.property.city || '-',
         'Property Summary',
         p.summary.revenue.actual,
         p.summary.counts.CONFIRMED
      ]);

      p.roomTypes?.forEach(rt => {
         propertySheet.addRow([ '', '', '', `Room: ${rt.roomType.name}`, rt.revenue.actual, rt.counts.CONFIRMED ]);
      });

      propertySheet.addRow([]); // spacer
   });

   propertySheet.getColumn(5).numFmt = '"Rp"#,##0';

   // --- Sheet 3: Reservations ---
   if (report.properties[0]?.data && report.properties[0].data.length > 0) {
      const resSheet = workbook.addWorksheet('Reservations');
      resSheet.addRow([ 'Reservation ID', 'Guest', 'Email', 'Check-in', 'Check-out', 'Status', 'Amount (Rp)' ]);
      resSheet.getRow(1).font = { bold: true };

      report.properties[0].data.forEach(item => {
         resSheet.addRow([
            item.id,
            `${item.user.firstName} ${item.user.lastName}`.trim(),
            item.user.email,
            formatDate(item.startDate),
            formatDate(item.endDate),
            item.orderStatus,
            item.paymentAmount
         ]);
      });

      resSheet.getColumn(7).numFmt = '"Rp"#,##0';
   }

   // --- Sheet 4: Filters Used ---
   const filterSheet = workbook.addWorksheet('Filters');
   filterSheet.addRow([ 'Filters Applied' ]);
   filterSheet.getRow(1).font = { bold: true };

   filterSheet.addRow([ 'Property ID', filters.propertyId || 'All' ]);
   filterSheet.addRow([ 'Room Type ID', filters.roomTypeId || 'All' ]);
   filterSheet.addRow([ 'Start Date', formatDate(filters.startDate) ]);
   filterSheet.addRow([ 'End Date', formatDate(filters.endDate) ]);
   filterSheet.addRow([ 'Status', (filters.status || []).join(', ') || 'All' ]);
   filterSheet.addRow([ 'Search', filters.search || 'None' ]);

   // Auto-fit column width
   workbook.eachSheet(sheet => {
      sheet.columns.forEach(column => {
         let maxLength = 10;
         column.eachCell?.({ includeEmpty: true }, cell => {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
         });
         column.width = Math.min(maxLength + 2, 50);
      });
   });

   // ✅ Generate and return Buffer
   const buffer = await workbook.xlsx.writeBuffer();
   return Buffer.from(buffer); // ✅ Ensure it's a Node.js Buffer
}

function formatDate (date: Date | string | null | undefined): string {
   if (!date) {
      return '-';
   }
   const d = new Date(date);
   return isNaN(d.getTime()) ? '-' : d.toISOString().split('T')[0];
}
