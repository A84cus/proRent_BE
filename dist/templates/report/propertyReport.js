"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPropertySheets = addPropertySheets;
// import { handleUnifiedReport } from '../../service/report/unifiedReport'; // Not needed, data is passed in
const helper_1 = require("./helper");
// Use the same constants as ownerReport.ts for consistency
const MAIN_TABLE_COLUMNS = 8;
const CHARS_PER_COLUMN_ESTIMATE = 15;
const MAX_COLUMN_WIDTH = 50; // From helper.ts autoFitColumns
const MIN_COLUMN_WIDTH = 5; // From helper.ts autoFitColumns
// --- Helper function to apply thin borders to a range (copied from ownerReport.ts) ---
function applyBordersToRange(sheet, startRow, startCol, endRow, endCol) {
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cell = sheet.getCell(row, col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }
}
function addPropertySheets(workbook, report, propertyId) {
    const property = report.properties.find(p => p.property.id === propertyId);
    if (!property) {
        return;
    }
    const sheetName = (0, helper_1.truncateSheetName)(`${property.property.name} Report`);
    const sheet = workbook.addWorksheet(sheetName);
    let currentRow = 1; // Keep track of the current row
    // --- Property Summary Title (specific to this property) ---
    const propertyReportTitleRow = sheet.addRow([`${property.property.name} Report`]);
    sheet.mergeCells(propertyReportTitleRow.number, 1, propertyReportTitleRow.number, MAIN_TABLE_COLUMNS);
    propertyReportTitleRow.getCell(1).font = { bold: true, size: 14 };
    propertyReportTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++; // Move to next row
    sheet.addRow([]); // Spacer row
    currentRow++;
    // --- Property Details ---
    sheet.addRow(['Name', property.property.name]);
    currentRow++;
    // --- Address Row with Dynamic Merging ---
    const addressLabelCell = sheet.getCell(currentRow, 1);
    addressLabelCell.value = 'Address';
    const addressValue = property.property.address || '-';
    const addressValueCell = sheet.getCell(currentRow, 2);
    addressValueCell.value = addressValue;
    // Estimate merge range based on address length
    const estimatedColumnsNeeded = Math.ceil(addressValue.length / CHARS_PER_COLUMN_ESTIMATE);
    // Ensure it merges at least the label column and minimum data column, and not exceed total columns
    const columnsToMerge = Math.max(2, Math.min(estimatedColumnsNeeded, MAIN_TABLE_COLUMNS));
    if (columnsToMerge > 1) {
        sheet.mergeCells(currentRow, 2, currentRow, columnsToMerge); // Merge B to column index
    }
    // Align address value
    addressValueCell.alignment = { vertical: 'top', wrapText: true };
    currentRow++;
    sheet.addRow(['City', property.property.city || '-']);
    currentRow++;
    sheet.addRow(['Province', property.property.province || '-']);
    currentRow++;
    sheet.addRow(['Rental Type', property.property.rentalType]);
    currentRow++;
    sheet.addRow([]); // Spacer row
    currentRow++;
    // --- Summary Title ---
    const summaryTitleRow = sheet.addRow(['Property Summary']);
    sheet.mergeCells(summaryTitleRow.number, 1, summaryTitleRow.number, MAIN_TABLE_COLUMNS);
    summaryTitleRow.getCell(1).font = { bold: true };
    summaryTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    const summaryTitleStartRow = currentRow;
    currentRow++;
    // --- Summary Details ---
    const summaryStartRow = currentRow;
    sheet.addRow(['Confirmed', property.summary.counts.CONFIRMED]);
    currentRow++;
    sheet.addRow(['Pending Payment', property.summary.counts.PENDING_PAYMENT]);
    currentRow++;
    sheet.addRow(['Pending Confirmation', property.summary.counts.PENDING_CONFIRMATION]);
    currentRow++;
    sheet.addRow(['Cancelled', property.summary.counts.CANCELLED]);
    currentRow++;
    const actualRevenueRow = sheet.addRow(['Actual Revenue', property.summary.revenue.actual]);
    actualRevenueRow.getCell(2).numFmt = '"Rp"#,##0';
    currentRow++;
    const projectedRevenueRow = sheet.addRow(['Projected Revenue', property.summary.revenue.projected]);
    projectedRevenueRow.getCell(2).numFmt = '"Rp"#,##0';
    currentRow++;
    sheet.addRow(['Average Revenue', property.summary.revenue.average]); // Assuming average doesn't need currency
    currentRow++;
    sheet.addRow(['Total Room Types', property.summary.totalRoomTypes]);
    currentRow++;
    sheet.addRow([]); // Spacer row
    currentRow++;
    // Apply border to Summary Details table
    const summaryEndRow = currentRow - 2; // Exclude the spacer row
    if (summaryEndRow >= summaryStartRow) {
        applyBordersToRange(sheet, summaryStartRow, 1, summaryEndRow, 2); // Border around label and value columns
    }
    // --- Room Types Title ---
    const roomTypesTitleRow = sheet.addRow(['Room Types']);
    sheet.mergeCells(roomTypesTitleRow.number, 1, roomTypesTitleRow.number, MAIN_TABLE_COLUMNS);
    roomTypesTitleRow.getCell(1).font = { bold: true };
    roomTypesTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;
    // --- Room Types Header Row ---
    const roomHeaderRow = sheet.addRow([
        'Room Name',
        'Confirmed',
        'Pending', // Combined PENDING_PAYMENT + PENDING_CONFIRMATION
        'Cancelled',
        'Actual Revenue',
        'Projected Revenue',
        'Unique Guests'
    ]);
    roomHeaderRow.font = { bold: true };
    const roomTypesHeaderStartRow = currentRow;
    currentRow++;
    // --- Room Types Data Rows ---
    const roomTypesDataStartRow = currentRow;
    let roomTypesDataEndRow = currentRow - 1; // Initialize
    property.roomTypes.forEach(rt => {
        const roomTypeDataRow = sheet.addRow([
            rt.roomType.name,
            rt.counts.CONFIRMED,
            rt.counts.PENDING_PAYMENT + rt.counts.PENDING_CONFIRMATION, // Combined Pending
            rt.counts.CANCELLED,
            rt.revenue.actual,
            rt.revenue.projected,
            rt.uniqueCustomers
        ]);
        // Format Revenue columns for this room type row
        roomTypeDataRow.getCell(5).numFmt = '"Rp"#,##0'; // Actual Revenue
        roomTypeDataRow.getCell(6).numFmt = '"Rp"#,##0'; // Projected Revenue
        roomTypeDataRow.alignment = { vertical: 'top' }; // Align data rows to top
        currentRow++;
        roomTypesDataEndRow = currentRow - 1; // Update end row
    });
    // Apply border to Room Types table (Header + Data)
    if (roomTypesDataEndRow >= roomTypesDataStartRow) {
        // Assuming 7 columns for Room Types table (A:G)
        applyBordersToRange(sheet, roomTypesHeaderStartRow, 1, roomTypesDataEndRow, 7);
    }
    sheet.addRow([]); // Space after room types table
    currentRow++;
    // --- Add reservations section for each room type ---
    property.roomTypes.forEach(rt => {
        // --- ALWAYS add the section header for THIS specific Room Type ---
        const reservationSectionTitleRow = sheet.addRow([`Reservations: ${rt.roomType.name}`]);
        sheet.mergeCells(reservationSectionTitleRow.number, 1, reservationSectionTitleRow.number, MAIN_TABLE_COLUMNS);
        reservationSectionTitleRow.getCell(1).font = { bold: true };
        reservationSectionTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        currentRow++;
        // --- ALWAYS add the column header row ---
        const resHeader = sheet.addRow(['ID', 'Guest', 'Email', 'Check-in', 'Check-out', 'Status', 'Amount', 'Invoice']);
        resHeader.font = { bold: true };
        const resHeaderStartRow = currentRow;
        currentRow++;
        // --- Get reservations for THIS room type ---
        const reservations = rt.reservationListItems;
        const resDataStartRow = currentRow;
        let resDataEndRow = currentRow - 1; // Initialize
        // --- Conditionally add reservation data rows or a placeholder ---
        if (reservations && reservations.length > 0) {
            // Add reservation data rows if there are reservations
            reservations.forEach(r => {
                const reservationDataRow = sheet.addRow([
                    r.id,
                    `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'Guest',
                    r.user.email,
                    r.startDate ? (0, helper_1.formatDate)(r.startDate) : '-',
                    r.endDate ? (0, helper_1.formatDate)(r.endDate) : '-',
                    r.orderStatus,
                    r.paymentAmount,
                    r.invoiceNumber || '-'
                ]);
                // Format Amount column for this reservation row
                reservationDataRow.getCell(7).numFmt = '"Rp"#,##0';
                reservationDataRow.alignment = { vertical: 'top' }; // Align data rows to top
                currentRow++;
                resDataEndRow = currentRow - 1; // Update end row
            });
        }
        else {
            // Optional: Add a placeholder row if no reservations
            const noResRow = sheet.addRow(['No reservations found for this period/filters.']);
            sheet.mergeCells(noResRow.number, 1, noResRow.number, MAIN_TABLE_COLUMNS);
            noResRow.getCell(1).alignment = { horizontal: 'center' };
            currentRow++;
            resDataEndRow = currentRow - 1; // Update end row for border
        }
        // Apply border to Reservations table (Header + Data/Placeholder)
        if (resDataEndRow >= resDataStartRow) {
            applyBordersToRange(sheet, resHeaderStartRow, 1, resDataEndRow, MAIN_TABLE_COLUMNS);
        }
        // Add space after this room type's reservations section
        sheet.addRow([]);
        currentRow++;
    });
    // --- End of Room Type Loop for Reservations ---
}
