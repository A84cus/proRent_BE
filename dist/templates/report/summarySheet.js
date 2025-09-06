"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSummarySheet = addSummarySheet;
// import { handleUnifiedReport } from '../../service/report/unifiedReport'; // Not needed, data is passed in
const helper_1 = require("./helper");
function addSummarySheet(workbook, report, context, format) {
    const sheet = workbook.addWorksheet('Summary');
    // Title
    sheet.mergeCells('A1', 'E1');
    sheet.getCell('A1').value = 'DASHBOARD REPORT';
    sheet.getCell('A1').font = { bold: true, size: 16 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };
    // Period
    const { startDate, endDate } = report.summary.period;
    sheet.addRow(['Period', `${(0, helper_1.formatDate)(startDate)} to ${(0, helper_1.formatDate)(endDate)}`]);
    sheet.addRow(['Generated On', new Date().toLocaleString()]);
    sheet.addRow(['Report Type', format]);
    sheet.addRow([]);
    // Global Summary
    const globalSummaryTitleRow = sheet.addRow(['OWNER-WIDE SUMMARY (All Properties)']);
    sheet.mergeCells(globalSummaryTitleRow.number, 1, globalSummaryTitleRow.number, 2); // Merge A & B
    // Assuming rows start at 1, headers take rows 1-4, first data row is 5
    const totalPropertiesRow = sheet.addRow(['Total Properties', report.summary.Global.totalProperties]);
    const activeBookingsRow = sheet.addRow(['Active Bookings', report.summary.Global.totalActiveBookings]);
    const actualRevenueGlobalRow = sheet.addRow(['Actual Revenue', report.summary.Global.totalActualRevenue]);
    const projectedRevenueGlobalRow = sheet.addRow(['Projected Revenue', report.summary.Global.totalProjectedRevenue]);
    // Apply currency format only to Global Revenue cells
    actualRevenueGlobalRow.getCell(2).numFmt = '"Rp"#,##0';
    projectedRevenueGlobalRow.getCell(2).numFmt = '"Rp"#,##0';
    sheet.addRow([]);
    const filteredSummaryTitleRow = sheet.addRow(['FILTERED SUMMARY']);
    sheet.mergeCells(filteredSummaryTitleRow.number, 1, filteredSummaryTitleRow.number, 2); // Merge A & B
    const confirmedRow = sheet.addRow(['Confirmed', report.summary.Aggregate.counts.CONFIRMED]);
    const pendingRow = sheet.addRow([
        'Pending',
        report.summary.Aggregate.counts.PENDING_PAYMENT + report.summary.Aggregate.counts.PENDING_CONFIRMATION
    ]);
    const actualRevenueFilteredRow = sheet.addRow(['Revenue (Actual)', report.summary.Aggregate.revenue.actual]);
    const projectedRevenueFilteredRow = sheet.addRow([
        'Revenue (Projected)',
        report.summary.Aggregate.revenue.projected
    ]);
    const avgRevenueRow = sheet.addRow(['Avg Revenue', report.summary.Aggregate.revenue.average]);
    // Apply currency format only to Filtered Revenue cells
    actualRevenueFilteredRow.getCell(2).numFmt = '"Rp"#,##0';
    projectedRevenueFilteredRow.getCell(2).numFmt = '"Rp"#,##0';
    avgRevenueRow.getCell(2).numFmt = '"Rp"#,##0';
    // Optional: Make titles bold
    globalSummaryTitleRow.font = { bold: true };
    filteredSummaryTitleRow.font = { bold: true };
}
