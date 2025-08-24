"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatReportForChart = formatReportForChart;
exports.getYearlyRevenueChart = getYearlyRevenueChart;
exports.getMonthlyRevenueChart = getMonthlyRevenueChart;
exports.getDailyRevenueChart = getDailyRevenueChart;
const reportDashboardService_1 = require("./reportDashboardService");
function formatReportForChart(report) {
    const summary = report.summary;
    const period = report.period;
    // Generate label based on period
    let label = 'Unknown';
    if (period.startDate && period.endDate) {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        if (start.getDate() === 1 && isLastDayOfMonth(end)) {
            // Month: "Aug 2025"
            label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        else if (start.getMonth() === 0 && start.getDate() === 1 && end.getMonth() === 11 && end.getDate() === 31) {
            // Year: "2025"
            label = start.getFullYear().toString();
        }
        else {
            // Daily or custom: "2025-08-01"
            label = start.toISOString().split('T')[0];
        }
    }
    return {
        label,
        actualRevenue: summary.revenue.actual,
        projectedRevenue: summary.revenue.projected,
        reservations: summary.counts.CONFIRMED + summary.counts.PENDING_PAYMENT + summary.counts.PENDING_CONFIRMATION
    };
}
function isLastDayOfMonth(date) {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return nextDay.getMonth() !== date.getMonth();
}
function getYearlyRevenueChart(ownerId, years // e.g., [2023, 2024, 2025]
) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield Promise.all(years.map((year) => __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(Date.UTC(year, 0, 1)); // Jan 1
            const endDate = new Date(Date.UTC(year, 11, 31)); // Dec 31
            const report = yield (0, reportDashboardService_1.getOwnerDashboardReport)(ownerId, {
                startDate,
                endDate
            });
            return formatReportForChart(report);
        })));
    });
}
function getMonthlyRevenueChart(ownerId, year) {
    return __awaiter(this, void 0, void 0, function* () {
        const months = Array.from({ length: 12 }, (_, i) => i);
        return yield Promise.all(months.map((monthIndex) => __awaiter(this, void 0, void 0, function* () {
            const startDate = new Date(Date.UTC(year, monthIndex, 1));
            const endDate = new Date(Date.UTC(year, monthIndex + 1, 0)); // Last day
            const report = yield (0, reportDashboardService_1.getOwnerDashboardReport)(ownerId, {
                startDate,
                endDate
            });
            return formatReportForChart(report);
        })));
    });
}
function getDailyRevenueChart(ownerId_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, days = 30) {
        const today = new Date();
        const points = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            const report = yield (0, reportDashboardService_1.getOwnerDashboardReport)(ownerId, {
                startDate: date,
                endDate: nextDay
            });
            points.push(formatReportForChart(report));
        }
        return points;
    });
}
