"use strict";
// src/controllers/report/chartController.ts
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
exports.dailyChartController = exports.monthlyChartController = exports.yearlyChartController = void 0;
const reportChartService_1 = require("../../service/report/reportChartService");
const yearlyChartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.user.id; // Adjust based on your auth middleware
        if (!ownerId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { years } = req.query;
        let yearList;
        if (!years) {
            // Default: last 3 years
            const currentYear = new Date().getFullYear();
            yearList = [currentYear - 2, currentYear - 1, currentYear];
        }
        else if (typeof years === 'string') {
            yearList = years.split(',').map(y => {
                const num = parseInt(y.trim(), 10);
                if (isNaN(num) || num < 1970 || num > 9999) {
                    throw new Error(`Invalid year: ${y}`);
                }
                return num;
            });
        }
        else {
            res.status(400).json({ error: 'Years must be a comma-separated list of numbers' });
            return;
        }
        const chartData = yield (0, reportChartService_1.getYearlyRevenueChart)(ownerId, yearList);
        res.status(200).json({
            type: 'yearly',
            data: chartData
        });
    }
    catch (error) {
        console.error('Error in yearlyChartController:', error);
        res.status(500).json({
            error: 'Failed to generate yearly revenue chart',
            details: error.message
        });
    }
});
exports.yearlyChartController = yearlyChartController;
const monthlyChartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.user.id;
        if (!ownerId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { year } = req.query;
        let targetYear = new Date().getFullYear();
        if (year) {
            const y = parseInt(year, 10);
            if (isNaN(y) || y < 1970 || y > 9999) {
                res.status(400).json({ error: 'Invalid year' });
                return;
            }
            targetYear = y;
        }
        const chartData = yield (0, reportChartService_1.getMonthlyRevenueChart)(ownerId, targetYear);
        res.status(200).json({
            type: 'monthly',
            year: targetYear,
            data: chartData
        });
    }
    catch (error) {
        console.error('Error in monthlyChartController:', error);
        res.status(500).json({
            error: 'Failed to generate monthly revenue chart',
            details: error.message
        });
    }
});
exports.monthlyChartController = monthlyChartController;
const dailyChartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const ownerId = req.user.id;
        if (!ownerId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { days } = req.query;
        let dayCount = 30;
        if (days) {
            const d = parseInt(days, 10);
            if (isNaN(d) || d < 1 || d > 90) {
                res.status(400).json({ error: 'Days must be between 1 and 90' });
                return;
            }
            dayCount = d;
        }
        const chartData = yield (0, reportChartService_1.getDailyRevenueChart)(ownerId, dayCount);
        res.status(200).json({
            type: 'daily',
            days: dayCount,
            data: chartData
        });
    }
    catch (error) {
        console.error('Error in dailyChartController:', error);
        res.status(500).json({
            error: 'Failed to generate daily revenue chart',
            details: error.message
        });
    }
});
exports.dailyChartController = dailyChartController;
