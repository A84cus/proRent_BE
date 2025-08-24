import express from 'express';
// import * as dashboardController from '../../controller/report/reportController';
import { chartReportController, dashboardReportController, reservationReportController } from '../../controller/report';
import { authOwner } from '../../middleware/auth/authMwr';

const router = express.Router();

// router.get('/summary', authOwner, dashboardController.getDashboardSummary);
router.get('/reservations', authOwner, reservationReportController.dashboardReportController);
router.get('/chart/yearly', authOwner, chartReportController.yearlyChartController);
router.get('/chart/monthly', authOwner, chartReportController.monthlyChartController);
router.get('/chart/daily', authOwner, chartReportController.dailyChartController);
router.get('/download/excel', authOwner, dashboardReportController.exportDashboardExcel);

export default router;
