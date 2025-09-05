"use strict";
// src/services/report/cronjobDateService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPeriodDateRange = getPeriodDateRange;
exports.getCurrentYearAndPreviousMonthInfo = getCurrentYearAndPreviousMonthInfo;
exports.getLastCompletedMonthPeriodKey = getLastCompletedMonthPeriodKey;
exports.getCurrentYearPeriodKey = getCurrentYearPeriodKey;
exports.getCustomPeriodKey = getCustomPeriodKey;
const cronjobHelperService_1 = require("./cronjobHelperService");
function getPeriodDateRange(periodType, periodKey, year, month) {
    try {
        const params = (0, cronjobHelperService_1.getDefaultPeriodParams)(periodType, periodKey, year, month);
        let startDate, endDate;
        if (params.periodType === 'DAY') {
            startDate = new Date(`${params.periodKey}T00:00:00Z`);
            endDate = new Date(`${params.periodKey}T23:59:59.999Z`);
        }
        else if (params.periodType === 'MONTH') {
            const [y, m] = params.periodKey.split('-').map(Number);
            startDate = new Date(Date.UTC(y, m - 1, 1));
            endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)); // Last ms of last day
        }
        else if (params.periodType === 'YEAR') {
            const y = params.year;
            startDate = new Date(Date.UTC(y, 0, 1)); // Jan 1 UTC
            endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999)); // Dec 31 UTC
        }
        else {
            throw new Error(`Unexpected periodType after validation: ${params.periodType}`);
        }
        return { startDate, endDate };
    }
    catch (error) {
        console.error('Error in getPeriodDateRange:', error);
        throw error;
    }
}
function getCurrentYearAndPreviousMonthInfo(periodType, periodKey, year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JS months are 0-11, we use 1-12
    let targetYear = null;
    let isCurrentYearCalculation = false;
    let previousMonthKey = null;
    if (periodType === 'YEAR') {
        targetYear = Number(periodKey);
        if (!isNaN(targetYear) && targetYear === currentYear) {
            isCurrentYearCalculation = true;
            // Determine the previous month key based on the current date
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            previousMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
        }
    }
    else if (periodType === 'MONTH') {
        const parts = periodKey.split('-');
        if (parts.length === 2) {
            const yearPart = Number(parts[0]);
            const monthPart = Number(parts[1]);
            if (!isNaN(yearPart) && !isNaN(monthPart) && yearPart === currentYear && monthPart === currentMonth) {
                if (yearPart === currentYear) {
                    isCurrentYearCalculation = true;
                    const prevMonthForTarget = monthPart === 1 ? 12 : monthPart - 1;
                    const prevYearForTarget = monthPart === 1 ? yearPart - 1 : yearPart;
                    previousMonthKey = `${prevYearForTarget}-${String(prevMonthForTarget).padStart(2, '0')}`;
                }
            }
        }
    }
    return { isCurrentYearCalculation, previousMonthKey };
}
function getLastCompletedMonthPeriodKey() {
    const now = new Date();
    // Get the first day of the current month
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Subtract one day to get the last day of the previous month
    const lastOfPreviousMonth = new Date(firstOfThisMonth.getTime() - 1);
    const year = lastOfPreviousMonth.getFullYear();
    const month = lastOfPreviousMonth.getMonth() + 1; // Convert to 1-12
    return `${year}-${String(month).padStart(2, '0')}`;
}
function getCurrentYearPeriodKey() {
    const now = new Date();
    return `${now.getFullYear()}`;
}
function getCustomPeriodKey(startDate, endDate) {
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);
    return `custom:${startStr}_to_${endStr}`;
}
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
