"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomPeriodKey = getCustomPeriodKey;
function getCustomPeriodKey(startDate, endDate) {
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
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
}
