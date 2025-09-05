"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReservationsSheet = addReservationsSheet;
exports.addAvailabilitySheet = addAvailabilitySheet;
exports.addFiltersSheet = addFiltersSheet;
exports.autoFitColumns = autoFitColumns;
exports.formatDate = formatDate;
exports.truncateSheetName = truncateSheetName;
const SHEET_NAME_MAX = 31;
// Maximum column width in characters (matching ownerReport)
const MAX_COLUMN_WIDTH = 26;
const MIN_COLUMN_WIDTH = 10;
// --- Helper function to apply thin borders to a range ---
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
// Updated addReservationsSheet to optionally include Property and Room Type columns and add borders
function addReservationsSheet(workbook, report, title, propertyId, roomTypeId, includePropertyRoomType = false // New flag
) {
    // Flatten reservation data, potentially filtering
    const reservationData = report.properties
        .filter(p => !propertyId || p.property.id === propertyId)
        .flatMap(p => p.roomTypes
        .filter(rt => !roomTypeId || rt.roomType.id === roomTypeId)
        .map(rt => rt.reservationListItems.map(r => ({ reservation: r, property: p.property, roomType: rt.roomType })))
        .flat());
    if (reservationData.length === 0) {
        return;
    }
    const sheet = workbook.addWorksheet(truncateSheetName(`${title} - Reservations`));
    // Define headers based on the flag
    const headers = includePropertyRoomType
        ? ['ID', 'Property', 'Room Type', 'Guest', 'Email', 'Check-in', 'Check-out', 'Status', 'Amount']
        : ['ID', 'Guest', 'Email', 'Check-in', 'Check-out', 'Status', 'Amount'];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    let currentRow = 1; // Track row for borders
    currentRow++; // Move past header
    // Add data rows
    const dataStartRow = currentRow;
    let dataEndRow = currentRow - 1; // Initialize
    reservationData.forEach(({ reservation: r, property, roomType }) => {
        // Prepare row data based on the flag
        const rowData = includePropertyRoomType
            ? [
                r.id,
                property.name, // Property Name
                roomType.name, // Room Type Name
                `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'Guest',
                r.user.email,
                formatDate(r.startDate),
                formatDate(r.endDate),
                r.orderStatus,
                r.paymentAmount
            ]
            : [
                r.id,
                `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() || 'Guest',
                r.user.email,
                formatDate(r.startDate),
                formatDate(r.endDate),
                r.orderStatus,
                r.paymentAmount
            ];
        const dataRow = sheet.addRow(rowData);
        // Format the 'Amount' column (last column in both cases)
        const amountColumnIndex = includePropertyRoomType ? 9 : 7;
        dataRow.getCell(amountColumnIndex).numFmt = '"Rp"#,##0';
        dataRow.alignment = { vertical: 'top' }; // Align data rows to top
        currentRow++;
        dataEndRow = currentRow - 1; // Update end row
    });
    // Apply border to the entire table (Header + Data)
    const numColumns = includePropertyRoomType ? 9 : 7;
    if (dataEndRow >= dataStartRow) {
        applyBordersToRange(sheet, 1, 1, dataEndRow, numColumns);
    }
    // Note: autoFitColumns is called in excelReport.ts after all sheets are added.
}
function addAvailabilitySheet(sheet, roomTypes, startRow = 1) {
    var _a;
    const dates = ((_a = roomTypes[0]) === null || _a === void 0 ? void 0 : _a.availability.dates.map(d => d.date)) || [];
    if (dates.length === 0) {
        return;
    }
    sheet.getCell(startRow, 1).value = 'Date';
    dates.forEach((date, i) => (sheet.getCell(startRow, i + 2).value = date));
    const dataStartRow = startRow + 1;
    roomTypes.forEach((rt, idx) => {
        sheet.getCell(startRow + idx + 1, 1).value = rt.roomType.name;
        rt.availability.dates.forEach((d, i) => {
            sheet.getCell(startRow + idx + 1, i + 2).value = d.available;
        });
    });
    // Optional: Add borders to the Availability table if needed
    // const dataEndRow = startRow + roomTypes.length;
    // const numColumns = dates.length + 1; // Date column + availability columns
    // applyBordersToRange(sheet, startRow, 1, dataEndRow, numColumns);
}
function addFiltersSheet(workbook, filters) {
    const sheet = workbook.addWorksheet('Filters');
    sheet.addRow(['Filter', 'Value']);
    sheet.getRow(1).font = { bold: true };
    sheet.addRow(['Property ID', filters.propertyId || 'All']);
    sheet.addRow(['Room Type ID', filters.roomTypeId || 'All']);
    sheet.addRow(['Start Date', formatDate(filters.startDate)]);
    sheet.addRow(['End Date', formatDate(filters.endDate)]);
    sheet.addRow(['Customer Name', filters.customerName || 'All']);
    sheet.addRow(['Email', filters.email || 'All']);
    sheet.addRow(['Invoice Number', filters.invoiceNumber || 'All']);
    // Note: autoFitColumns is called in excelReport.ts after all sheets are added.
    // Optional: Add borders to the Filters table
    // applyBordersToRange(sheet, 1, 1, 8, 2); // Assuming 8 rows of data
}
// Ensure autoFitColumns works correctly with new limits
function autoFitColumns(workbook) {
    workbook.eachSheet(sheet => {
        // Iterate through columns by index (1-based)
        sheet.columns.forEach((column, index) => {
            var _a;
            let maxLength = MIN_COLUMN_WIDTH; // Start with minimum width
            // Iterate through cells in the column
            (_a = column.eachCell) === null || _a === void 0 ? void 0 : _a.call(column, { includeEmpty: true }, cell => {
                var _a, _b;
                // Get the string representation of the cell value
                const cellValue = (_b = (_a = cell.value) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                maxLength = Math.max(maxLength, cellValue.length);
            });
            // Set the column width, capped by the new maximum
            column.width = Math.min(Math.max(maxLength + 2, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH);
        });
    });
}
function formatDate(date) {
    if (!date) {
        return '-';
    }
    // Ensure it's a Date object and format it
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        // Check for invalid date
        return '-';
    }
    return d.toISOString().split('T')[0];
}
function truncateSheetName(name) {
    return name.length > SHEET_NAME_MAX ? `${name.substring(0, SHEET_NAME_MAX - 3)}...` : name;
}
