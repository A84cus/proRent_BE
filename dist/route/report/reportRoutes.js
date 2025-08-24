"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import * as dashboardController from '../../controller/report/reportController';
const report_1 = require("../../controller/report");
const authMwr_1 = require("../../middleware/auth/authMwr");
const router = express_1.default.Router();
// router.get('/summary', authOwner, dashboardController.getDashboardSummary);
router.get('/reservations', authMwr_1.authOwner, report_1.reservationReportController.dashboardReportController);
router.get('/chart/yearly', authMwr_1.authOwner, report_1.chartReportController.yearlyChartController);
router.get('/chart/monthly', authMwr_1.authOwner, report_1.chartReportController.monthlyChartController);
router.get('/chart/daily', authMwr_1.authOwner, report_1.chartReportController.dailyChartController);
router.get('/download/excel', authMwr_1.authOwner, report_1.dashboardReportController.exportDashboardExcel);
exports.default = router;
