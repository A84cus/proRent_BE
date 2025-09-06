"use strict";
// src/services/report/dashboard/utils/buildPeriodConfig.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPeriodConfig = buildPeriodConfig;
const periodKeyUtils_1 = require("./periodKeyUtils");
const reportUtils_1 = require("../reportUtils");
function buildPeriodConfig(startDate, endDate) {
    let periodType = 'YEAR';
    let periodKey = `${new Date().getFullYear()}`;
    let year = new Date().getFullYear();
    let month = null;
    if (startDate || endDate) {
        const yearKey = (0, periodKeyUtils_1.getYearPeriodKey)(startDate, endDate);
        if (yearKey) {
            periodType = 'YEAR';
            periodKey = yearKey;
            year = parseInt(yearKey);
            month = null;
        }
        else {
            const monthKey = (0, periodKeyUtils_1.getMonthPeriodKey)(startDate, endDate);
            if (monthKey) {
                periodType = 'MONTH';
                periodKey = monthKey;
                year = parseInt(monthKey.split('-')[0]);
                month = parseInt(monthKey.split('-')[1]);
            }
            else {
                periodType = 'CUSTOM';
                periodKey = (0, reportUtils_1.getCustomPeriodKey)(startDate, endDate);
                year = startDate.getFullYear();
                month = null;
            }
        }
    }
    return { periodType, periodKey, year, month };
}
