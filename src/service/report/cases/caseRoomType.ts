// // src/services/report/dashboard/cases/case3_withRoomType.ts
// import prisma from '../../../prisma';
// import { DashboardContext } from '../../../interfaces/report/reportCustomInterface';
// import { getReservationReport } from '../customReportService';
// import * as ReportInterface from '../../../interfaces/report/reportCustomInterface';
// import { upsertRoomTypePerformanceSummary } from '../roomTypeSummaryService';
// import * as availabilityService from '../../reservationService/availabilityService';

// export async function handleCase3 (context: DashboardContext): Promise<ReportInterface.DashboardReportResponse> {
//    const { ownerId, filters, options, period, periodConfig } = context;
//    const { propertyId, roomTypeId } = filters;

//    const roomType = await prisma.roomType.findUnique({
//       where: { id: roomTypeId },
//       select: {
//          id: true,
//          name: true,
//          property: {
//             select: {
//                id: true,
//                name: true,
//                mainPicture: true,
//                location: { select: { address: true, city: { select: { name: true } } } }
//             }
//          }
//       }
//    });

//    if (!roomType) {
//       throw new Error(`RoomType ${roomTypeId} not found.`);
//    }

//    const fullReport = await getReservationReport({ ownerId, propertyId, roomTypeId, ...filters }, options);

//    const customerMap = new Map<string, ReportInterface.CustomerMin>();
//    for (const item of fullReport.data) {
//       customerMap.set(item.user.id, {
//          id: item.user.id,
//          email: item.user.email,
//          firstName: item.user.profile.firstName,
//          lastName: item.user.profile.lastName
//       });
//    }

//    const data = fullReport.data.map(item => ({
//       id: item.id,
//       userId: item.userId,
//       startDate: item.startDate,
//       endDate: item.endDate,
//       orderStatus: item.orderStatus,
//       paymentAmount: item.paymentAmount,
//       user: {
//          email: item.user.email,
//          firstName: item.user.profile.firstName,
//          lastName: item.user.profile.lastName
//       }
//    }));

//    await upsertRoomTypePerformanceSummary({
//       roomTypeId: roomTypeId ?? '',
//       propertyId,
//       ...periodConfig,
//       totalRevenue: fullReport.summary.revenue.actual,
//       projectedRevenue: fullReport.summary.revenue.projected,
//       totalReservations: fullReport.summary.totalReservations,
//       totalNightsBooked: 0,
//       confirmedCount: fullReport.summary.counts.CONFIRMED,
//       pendingPaymentCount: fullReport.summary.counts.PENDING_PAYMENT,
//       pendingConfirmationCount: fullReport.summary.counts.PENDING_CONFIRMATION,
//       cancelledCount: fullReport.summary.counts.CANCELLED,
//       uniqueUsers: customerMap.size,
//       OwnerId: ownerId
//    });

//    const totalQuantity = await availabilityService.getRoomTypeTotalQuantity(roomType.id);
//    const availabilityRecords = await availabilityService.getActualAvailabilityRecords(
//       roomType.id,
//       filters.startDate ?? undefined,
//       filters.endDate ?? undefined
//    );

//    const availability = availabilityRecords.map(record => {
//       const dateKey = record.date.toISOString().split('T')[0];
//       return {
//          date: dateKey,
//          available: record.availableCount,
//          isAvailable: record.availableCount > 0
//       };
//    });

//    const propertySummary: ReportInterface.PropertySummary = {
//       property: {
//          id: roomType.property.id,
//          name: roomType.property.name,
//          Picture: roomType.property.mainPicture?.url ?? null,
//          address: roomType.property.location?.address ?? null,
//          city: roomType.property.location?.city.name ?? null
//       },
//       period,
//       summary: fullReport.summary,
//       uniqueCustomers: Array.from(customerMap.values()),
//       data,
//       pagination: fullReport.pagination,
//       roomTypes: [
//          {
//             roomType: { id: roomTypeId ?? '', name: roomType.name },
//             counts: fullReport.summary.counts,
//             revenue: fullReport.summary.revenue,
//             availability: { totalQuantity, dates: availability }
//          }
//       ]
//    };
//    return {
//       properties: [ propertySummary ],
//       summary: fullReport.summary,
//       period,
//       pagination: fullReport.pagination
//    };
// }
