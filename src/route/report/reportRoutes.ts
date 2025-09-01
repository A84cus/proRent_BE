import express from 'express';
import { chartReportController, reservationReportController, dashboardReportController } from '../../controller/report';
import { authOwner } from '../../middleware/auth/authMwr';

const router = express.Router();

router.get('/reservations', authOwner, reservationReportController.dashboardReportController);
router.get('/chart/yearly', authOwner, chartReportController.yearlyChartController);
router.get('/chart/monthly', authOwner, chartReportController.monthlyChartController);
router.get('/chart/daily', authOwner, chartReportController.dailyChartController);
router.get('/download/excel', authOwner, dashboardReportController.exportDashboardExcel);

export default router;
