"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRoomTypeSheets = addRoomTypeSheets;
// import { handleUnifiedReport } from '../../service/report/unifiedReport'; // Not needed, data is passed in
const helper_1 = require("./helper");
// Use the same constants as ownerReport.ts for consistency
const MAIN_TABLE_COLUMNS = 8;
const CHARS_PER_COLUMN_ESTIMATE = 15;
// MAX_COLUMN_WIDTH and MIN_COLUMN_WIDTH are handled in autoFitColumns via helper.ts
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
function addRoomTypeSheets(workbook, report, roomTypeId) {
    // Find the room type and its parent property across all properties in the report
    let targetRoomType, parentProperty;
    for (const propertySummary of report.properties) {
        const foundRt = propertySummary.roomTypes.find(rt => rt.roomType.id === roomTypeId);
        if (foundRt) {
            targetRoomType = foundRt;
            parentProperty = propertySummary.property;
            break; // Stop searching once found
        }
    }
    if (!targetRoomType || !parentProperty) {
        // Room type not found in the report data
        return;
    }
    const sheetName = (0, helper_1.truncateSheetName)(`${targetRoomType.roomType.name} Report`);
    const sheet = workbook.addWorksheet(sheetName);
    let currentRow = 1; // Keep track of the current row
    // --- Room Type Report Title ---
    const roomTypeReportTitleRow = sheet.addRow([`${targetRoomType.roomType.name} Report`]);
    sheet.mergeCells(roomTypeReportTitleRow.number, 1, roomTypeReportTitleRow.number, MAIN_TABLE_COLUMNS);
    roomTypeReportTitleRow.getCell(1).font = { bold: true, size: 14 };
    roomTypeReportTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++; // Move to next row
    sheet.addRow([]); // Spacer row
    currentRow++;
    // --- Room Type & Property Details ---
    sheet.addRow(['Room Type Name', targetRoomType.roomType.name]);
    currentRow++;
    sheet.addRow(['Property Name', parentProperty.name]);
    currentRow++;
    // --- Property Address Row with Dynamic Merging ---
    const addressLabelCell = sheet.getCell(currentRow, 1);
    addressLabelCell.value = 'Property Address';
    const addressValue = parentProperty.address || '-';
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
    sheet.addRow(['City', parentProperty.city || '-']);
    currentRow++;
    sheet.addRow(['Province', parentProperty.province || '-']);
    currentRow++;
    sheet.addRow(['Rental Type', parentProperty.rentalType]);
    currentRow++;
    sheet.addRow([]); // Spacer row
    currentRow++;
    // --- Room Type Summary Title ---
    const summaryTitleRow = sheet.addRow(['Room Type Summary']);
    sheet.mergeCells(summaryTitleRow.number, 1, summaryTitleRow.number, MAIN_TABLE_COLUMNS);
    summaryTitleRow.getCell(1).font = { bold: true };
    summaryTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    const summaryTitleStartRow = currentRow;
    currentRow++;
    // --- Room Type Summary Details ---
    const summaryStartRow = currentRow;
    sheet.addRow(['Confirmed', targetRoomType.counts.CONFIRMED]);
    currentRow++;
    sheet.addRow(['Pending Payment', targetRoomType.counts.PENDING_PAYMENT]);
    currentRow++;
    sheet.addRow(['Pending Confirmation', targetRoomType.counts.PENDING_CONFIRMATION]);
    currentRow++;
    sheet.addRow(['Cancelled', targetRoomType.counts.CANCELLED]);
    currentRow++;
    const actualRevenueRow = sheet.addRow(['Actual Revenue', targetRoomType.revenue.actual]);
    actualRevenueRow.getCell(2).numFmt = '"Rp"#,##0';
    currentRow++;
    const projectedRevenueRow = sheet.addRow(['Projected Revenue', targetRoomType.revenue.projected]);
    projectedRevenueRow.getCell(2).numFmt = '"Rp"#,##0';
    currentRow++;
    sheet.addRow(['Average Revenue', targetRoomType.revenue.average]); // Assuming average doesn't need currency
    currentRow++;
    sheet.addRow(['Unique Guests', targetRoomType.uniqueCustomers]);
    currentRow++;
    sheet.addRow(['Total Quantity', targetRoomType.availability.totalQuantity]);
    currentRow++;
    sheet.addRow([]); // Spacer row
    currentRow++;
    // Apply border to Summary Details table
    const summaryEndRow = currentRow - 2; // Exclude the spacer row
    if (summaryEndRow >= summaryStartRow) {
        applyBordersToRange(sheet, summaryStartRow, 1, summaryEndRow, 2); // Border around label and value columns
    }
    // --- Reservations Section Title ---
    const reservationsTitleRow = sheet.addRow([`Reservations for ${targetRoomType.roomType.name}`]);
    sheet.mergeCells(reservationsTitleRow.number, 1, reservationsTitleRow.number, MAIN_TABLE_COLUMNS);
    reservationsTitleRow.getCell(1).font = { bold: true };
    reservationsTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;
    // --- Reservations Header Row ---
    const resHeader = sheet.addRow(['ID', 'Guest', 'Email', 'Check-in', 'Check-out', 'Status', 'Amount', 'Invoice']);
    resHeader.font = { bold: true };
    const resHeaderStartRow = currentRow;
    currentRow++;
    // --- Get reservations for THIS room type ---
    const reservations = targetRoomType.reservationListItems;
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
    // Note: The separate "Reservations" sheet is added by addReservationsSheet below.
    // Add the separate "All Reservations for [RoomTypeName]" sheet at the end
    (0, helper_1.addReservationsSheet)(workbook, report, `All Reservations for ${targetRoomType.roomType.name}`, undefined, roomTypeId, true);
}
