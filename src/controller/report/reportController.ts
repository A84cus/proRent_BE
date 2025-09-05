// import { Request, Response } from 'express';
// import * as summaryService from '../../service/report/reportDashboardService';
// import * as chartService from '../../service/report/reportChartService';
// import { DEFAULT_REPORT_QUERY, ReportQuery } from '../../interfaces/report/reportDashboardInterface';
// import { getUserIdFromRequest } from '../reservationController';

// export const getDashboardSummary = async (req: Request, res: Response) => {
//    const ownerId = getUserIdFromRequest(req);
//    const year = Number(req.query.year) || new Date().getFullYear();

//    try {
//       const [ revenue, properties, month ] = await Promise.all([
//          summaryService.getTotalRevenue(ownerId, year),
//          summaryService.getTotalProperties(ownerId),
//          summaryService.getMostReservedMonth(ownerId, year)
//       ]);
//       res.json({ totalRevenue: revenue, totalProperties: properties, mostReservedMonth: month });
//    } catch (error) {
//       res.status(500).json({ error: 'Failed to load summary' });
//    }
// };

// export const getTopSalesCharts = async (req: Request, res: Response) => {
//    const ownerId = getUserIdFromRequest(req);
//    const year = Number(req.query.year) || new Date().getFullYear();

//    try {
//       const [ properties, roomTypes ] = await Promise.all([
//          summaryService.getTop5PropertySales(ownerId, year),
//          summaryService.getTop5RoomTypeSales(ownerId, year)
//       ]);
//       res.json({ topProperties: properties, topRoomTypes: roomTypes });
//    } catch (error) {
//       res.status(500).json({ error: 'Failed to load sales charts' });
//    }
// };

// export const getPropertyList = async (req: Request, res: Response) => {
//    const ownerId = getUserIdFromRequest(req);
//    const year = Number(req.query.year) || new Date().getFullYear();
//    const query = parseReportQuery(req.query);

//    try {
//       const list = await summaryService.getPropertyListForDashboard(ownerId, year, query);
//       res.json(list);
//    } catch (error) {
//       res.status(500).json({ error: 'Failed to load property list' });
//    }
// };

// export const getPropertyDetail = async (req: Request, res: Response) => {
//    const { propertyId } = req.params;
//    const ownerId = getUserIdFromRequest(req);
//    const year = Number(req.query.year) || new Date().getFullYear();
//    const query = parseReportQuery(req.query);

//    try {
//       const detail = await chartService.getPropertyDetail(propertyId, ownerId, year, query);
//       res.json(detail);
//    } catch (error: any) {
//       res.status(403).json({ error: error.message });
//    }
// };

// function parseReportQuery (query: any): ReportQuery {
//    return {
//       ...DEFAULT_REPORT_QUERY,
//       page: Number(query.page) || DEFAULT_REPORT_QUERY.page,
//       limit: Math.min(Number(query.limit) || DEFAULT_REPORT_QUERY.limit, 100),
//       sortBy: query.sortBy || DEFAULT_REPORT_QUERY.sortBy,
//       sortOrder: [ 'asc', 'desc' ].includes(query.sortOrder) ? query.sortOrder : 'desc',
//       filters: {
//          year: Number(query.year),
//          search: query.search,
//          rentalType: query.rentalType
//       }
//    };
// }

// export const getMonthlyChart = async (req: Request, res: Response) => {
//    const ownerId = getUserIdFromRequest(req);
//    const year = Number(req.query.year) || new Date().getFullYear();
//    try {
//       const data = await chartService.getMonthlyRevenueChartData(ownerId, year);
//       res.json(data);
//    } catch (error) {
//       res.status(500).json({ error: 'Failed to load monthly chart' });
//    }
// };

// export const getDailyChart = async (req: Request, res: Response) => {
//    const ownerId = getUserIdFromRequest(req);
//    const year = Number(req.query.year) || new Date().getFullYear();
//    const month = Number(req.query.month) || new Date().getMonth() + 1;
//    try {
//       const data = await chartService.getDailyRevenueForMonth(ownerId, year, month);
//       res.json(data);
//    } catch (error) {
//       res.status(500).json({ error: 'Failed to load daily chart' });
//    }
// };
